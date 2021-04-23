export interface UpdateProductApiModel {
    combinations: UpdateProductCombinationsData;
    sales: UpdateProductWholeSaleData;
    slides: UpdateProductSlidesData;
    product: ProductUpdateData;
    entityBackgrounds: UpdateProductWithEntityImage;
}

export interface UpdateProductSlidesData {
    new: ProductSlideNew[],
    update: ProductSlideUpdate[]
}

export interface UpdateProductWholeSaleData {
    new: ProductSalesNew[],
    update: ProductSalesUpdate[]
}

interface UpdateProductWithEntityImage {
    new: ProductEntityImageNew[];
    update: ProductEntityImageUpdate[];
}

export interface ProductEntityImageUpdate {
    id_background: number;
    process_image: number;
}

export interface ProductEntityImageNew {
    entity: number;
    process_image: number;
}

export interface UpdateProductCombinationsData {
    new: ProductCombinationNew[],
    update: ProductCombinationUpdateData[]
}

interface NewCombination {
    entity: number;
}

interface ProductCombinationNew {
    combination: NewCombination[];
    count: number;
    image: number;
}

export interface ProductCombinationUpdate {
    image: number;
    entity_id: number;
    combination_id: number;
}

export interface ProductCombinationUpdateData {
    data: ProductCombinationDataUpdate;
    id: number;
}

interface ProductCombinationDataUpdate {
    count: number;
    image: number;
}

export interface ProductSalesNew {
    min_qty: number;
    discount: number;
    id: number | null;
}

export interface ProductSalesUpdate {
    id: number;
    discount: number;
}

export interface ProductSlideNew  {
    process_image: number;
    link: string | null;
    id: number | null;
}

export interface ProductSlideUpdate {
    id: 54;
    link: string | null;
}

export interface ProductUpdateData {
    name: string;
    slug: string;
    id_process_image: number;
    category_id: number;
    price: number;
    price_sale: number;
    sku: string;
    description: string | null;
}