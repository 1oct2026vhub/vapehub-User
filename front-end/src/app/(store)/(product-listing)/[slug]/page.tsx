 
import CategoryProducts from "../CategoryProducts";

type PageProps = {
  slug: string;
};
 const Page = async ({
  params,
}: {
  params: Promise<PageProps>
}) => {
  const slug = (await params).slug;
  console.log(slug);
  return <CategoryProducts  />
}

export default Page;