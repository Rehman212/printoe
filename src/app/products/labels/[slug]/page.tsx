import { makeShopCategoryRoute } from "@/lib/shop-category-route";

const route = makeShopCategoryRoute("labels");
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
