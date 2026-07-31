import { makeShopCategoryRoute } from "@/lib/shop-category-route";

const route = makeShopCategoryRoute("postcards");
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
