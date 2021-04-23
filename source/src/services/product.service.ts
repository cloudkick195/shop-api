import {PostService} from "./post.service";
import {HttpService} from "./http.service";
import {Injectable} from "../decorators/injectable.decorator";

@Injectable({
    providerIn: 'root'
})
export class ProductService {
    public a: string = '';

    constructor(private postService: PostService, private httpService: HttpService) { }

    public getListProducts(): string {
        return this.httpService.getMeta();
    }
}