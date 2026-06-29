import { model, Schema } from "mongoose";

const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaIds: [
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
