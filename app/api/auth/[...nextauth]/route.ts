import { handlers } from "@/auth";

export const runtime = "nodejs";

function logRouteError(error: unknown) {
  if (error instanceof Error) {
    console.error(
      "[auth-route][error]",
      JSON.stringify(
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: "cause" in error ? error.cause : undefined,
        },
        null,
        2,
      ),
    );
  } else {
    console.error("[auth-route][error]", JSON.stringify(error, null, 2));
  }
}

export async function GET(request: Request) {
  try {
    return await handlers.GET(request);
  } catch (error) {
    logRouteError(error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    return await handlers.POST(request);
  } catch (error) {
    logRouteError(error);
    throw error;
  }
}

