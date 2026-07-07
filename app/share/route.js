import { NextResponse } from "next/server";
import { getStoryBrowsePath } from "../../utils/storyCanonical";

/** Permanent redirect legacy /share?q={id} links to /browse/{companyId}/{storyId}. */
export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q");
  const path = q ? await getStoryBrowsePath(q) : null;
  const destination = path || "/browse";
  return NextResponse.redirect(new URL(destination, request.url), 301);
}
