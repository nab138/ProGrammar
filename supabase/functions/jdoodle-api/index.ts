import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";
const allowedOrigins = [
  "http://localhost:8100",
  "capacitor://localhost",
  "http://localhost",
];

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") ?? "";
  if (!allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: "Not allowed" }), {
      headers: { "Content-Type": "application/json" },
      status: 403,
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  // Get the session or user object
  const { data, error } = await supabaseClient.auth.getUser();
  const user = data.user;
  if (error) {
    return new Response(JSON.stringify({ error }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 401,
    });
  }
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", ...corsHeaders }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401,
      },
    );
  }

  const { script, language, versionIndex } = await req.json();

  const clientID = Deno.env.get("JDOODLE_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("JDOODLE_CLIENT_SECRET") ?? "";

  const program = {
    script: script,
    language: language,
    versionIndex: versionIndex,
    clientId: clientID,
    clientSecret: clientSecret,
  };

  try {
    const response = await fetch(
      "https://api.jdoodle.com/v1/execute",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...corsHeaders },
        body: JSON.stringify(program),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({
          error: "Error executing code",
          message: errorData.error,
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 500,
        },
      );
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Cannot Connect", message: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      },
    );
  }
});
