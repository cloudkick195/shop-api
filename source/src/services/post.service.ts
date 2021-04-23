import {Injectable} from "../decorators/injectable.decorator";

@Injectable({
    providerIn: 'root'
})
export class PostService {
    public getData(): any {
        return 'anh2';
    }

}