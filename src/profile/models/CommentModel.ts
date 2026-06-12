export interface CommentModel {
  id: string;
  commentOwnerId: string;
  data: unknown[];
}

export function createComment(partial: Partial<CommentModel> & { id: string; commentOwnerId: string }): CommentModel {
  return {
    id: partial.id,
    commentOwnerId: partial.commentOwnerId,
    data: partial.data ?? [],
  };
}
