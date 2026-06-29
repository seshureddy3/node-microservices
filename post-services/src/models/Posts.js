import { model, Schema } from "mongoose";

const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    mediaId: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

PostSchema.index({ content: "text" });

const Post = model("Post", PostSchema);
export default Post;
