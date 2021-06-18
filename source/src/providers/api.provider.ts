import ProductApi from "./../apis/product.api";
import PostApi from "./../apis/post.api";
import { MediaController } from './../apis/upload.api';
import { AuthController } from "./../apis/auth.api";
import { ProductCategoryApi } from "../apis/product-category.api";
import {PostCategoryApi } from "../apis/post-category.api";
import { ProductEntityFilterApi } from '../apis/product-entity-filter.api';
import { ProductAttributeFilterApi } from "../apis/product-attribute-filter.api";
import { MainSlideApi } from "../apis/main-slide.api";
import { InformationApi } from "../apis/information.api";
import { CustomerFeedback } from "../apis/customer-feedback.api";
import { CustomerController } from "../apis/customer.api";
import { ProductCombinationApi } from "../apis/product-combination.api";
import { ProductSlideApi } from "../apis/product-slide.api";
import { PolicyApi } from "../apis/policy.api";
import { UserApi } from "../apis/user.api";
import { OrderApi } from "../apis/order.api";
import SaleApi from "../apis/sale.api";

export default class ApiProvider {
    private provider_array: any = [
        ProductApi,
        PostApi,
        MediaController,
        AuthController,
        ProductCategoryApi,
        PostCategoryApi,
        ProductEntityFilterApi,
        ProductAttributeFilterApi,
        MainSlideApi,
        InformationApi,
        CustomerController,
        CustomerFeedback,
        ProductCombinationApi,
        ProductSlideApi,
        PolicyApi,
        UserApi,
        OrderApi,
        SaleApi
    ];

    constructor() { }

    public get providers(): any {
        return this.provider_array;
    }
}