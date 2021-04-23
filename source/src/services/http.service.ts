import {PostService} from "./post.service";
import {Injectable} from "../decorators/injectable.decorator";

@Injectable({
    providerIn: 'root'
})
export class HttpService {

    constructor(private postService: PostService) {}

    public getMeta() {
        return this.postService.getData();
    }
}