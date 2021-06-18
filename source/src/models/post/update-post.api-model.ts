export interface UpdatePostApiModel {
    post: PostUpdateData;
}



export interface PostUpdateData {
    name: string;
    slug: string;
    id_process_image: number;
    category_id: number;
    description: string | null;
    sumary: string | null;
}