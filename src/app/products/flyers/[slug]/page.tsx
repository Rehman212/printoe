import { makeShopCategoryRoute } from "@/lib/shop-category-route";

const route = makeShopCategoryRoute("flyers");
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
