// Cloudflare Worker: /api/* 만 처리하고 나머지는 정적 SPA(dist)로 넘긴다.
// 저장소는 D1(binding: DB). state 객체 하나를 user_id 별로 upsert.

const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers || {}) },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/state") {
      try {
        if (request.method === "GET") {
          const uid = url.searchParams.get("uid");
          if (!uid) return json({ error: "uid required" }, { status: 400 });
          const row = await env.DB.prepare("select data from user_state where user_id = ?")
            .bind(uid)
            .first();
          return json(row ? JSON.parse(row.data) : null, {
            headers: { "cache-control": "no-store" },
          });
        }

        if (request.method === "PUT") {
          const body = await request.json();
          const uid = body && body.uid;
          if (!uid) return json({ error: "uid required" }, { status: 400 });
          await env.DB.prepare(
            "insert into user_state (user_id, data, updated_at) values (?1, ?2, datetime('now')) " +
              "on conflict(user_id) do update set data = ?2, updated_at = datetime('now')"
          )
            .bind(uid, JSON.stringify(body.data ?? null))
            .run();
          return new Response(null, { status: 204 });
        }

        return json({ error: "method not allowed" }, { status: 405 });
      } catch (err) {
        return json({ error: String(err && err.message ? err.message : err) }, { status: 500 });
      }
    }

    // 그 외 전부 정적 자산(SPA)
    return env.ASSETS.fetch(request);
  },
};
