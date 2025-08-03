export async function GET(context, next) {
  console.log(context)

  // do something before calling `next`
  const response = await next();
  // do something with the response from `next`
  return response;
}
