import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Eye, Heart, Share2 } from "lucide-react";
import { PulseButton } from "../../components/PulseButton";
import { useAppState } from "../../contexts/AppStateContext";

export function CommunityPostDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const {
    currentCommunityPost: post,
    loadCommunityPost,
    likeCommunityPost,
    loading,
  } = useAppState();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (postId) {
      loadCommunityPost(Number(postId));
    }
  }, [postId]);

  const handleLike = async () => {
    if (!post || liked) return;
    try {
      await likeCommunityPost(post.id);
      setLiked(true);
    } catch {
      // silently ignore
    }
  };

  // Loading skeleton
  if (loading && !post) {
    return (
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e1db]">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => navigate("/community")}>
              <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <span className="text-base text-[#3a2a1a]">树洞</span>
            <div className="w-5 h-5" />
          </div>
        </div>

        {/* Skeleton body */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white px-5 py-6 mb-2 animate-pulse">
            <div className="h-6 bg-[#e5e1db] rounded w-3/4 mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-12 bg-[#e5e1db] rounded" />
              <div className="h-4 w-16 bg-[#e5e1db] rounded" />
              <div className="h-4 w-16 bg-[#e5e1db] rounded" />
            </div>
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[#e5e1db]">
              <div className="h-6 w-16 bg-[#e5e1db] rounded-full" />
              <div className="h-6 w-16 bg-[#e5e1db] rounded-full" />
              <div className="h-6 w-16 bg-[#e5e1db] rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-[#e5e1db] rounded w-full" />
              <div className="h-4 bg-[#e5e1db] rounded w-full" />
              <div className="h-4 bg-[#e5e1db] rounded w-5/6" />
              <div className="h-4 bg-[#e5e1db] rounded w-4/6" />
            </div>
            <div className="mt-6 h-48 bg-[#e5e1db] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // No post found after loading
  if (!post) {
    return (
      <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-[#e5e1db]">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => navigate("/community")}>
              <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
            </button>
            <span className="text-base text-[#3a2a1a]">树洞</span>
            <div className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8a7a6a]">帖子不存在或已被删除</p>
        </div>
      </div>
    );
  }

  const hasImages = post.image_urls && post.image_urls.length > 0;
  const hasTags = post.city || post.emotion || post.scene;
  const createdDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="w-full max-w-[430px] h-[100dvh] mx-auto bg-[#f8f6f3] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e1db]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navigate("/community")}>
            <ArrowLeft className="w-5 h-5 text-[#5a4a3a]" />
          </button>
          <span className="text-base text-[#3a2a1a]">树洞</span>
          <button>
            <Share2 className="w-5 h-5 text-[#8a7a6a]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Article */}
        <div className="bg-white px-5 py-6 mb-2">
          {/* Title */}
          <h1 className="text-xl text-[#3a2a1a] mb-4 leading-relaxed">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-4 text-xs text-[#8a7a6a]">
            {post.is_anonymous && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded">匿名</span>
            )}
            {createdDate && <span>{createdDate}</span>}
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{post.likes}</span>
            </div>
          </div>

          {/* Tags */}
          {hasTags && (
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[#e5e1db]">
              {post.city && (
                <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-full">
                  {post.city}
                </span>
              )}
              {post.emotion && (
                <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-full">
                  {post.emotion}
                </span>
              )}
              {post.scene && (
                <span className="px-3 py-1.5 bg-orange-50 text-orange-700 text-xs rounded-full">
                  {post.scene}
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm">
            {post.content.split("\n").filter(Boolean).map((paragraph, idx) => (
              <p
                key={idx}
                className="text-sm text-[#3a2a1a] leading-loose mb-4"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Images */}
          {hasImages && (
            <div className="mb-6">
              {post.image_urls.length === 1 && (
                <img
                  src={post.image_urls[0]}
                  alt={post.title}
                  className="w-full rounded-2xl aspect-video object-cover"
                />
              )}
              {post.image_urls.length === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {post.image_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${post.title} ${idx + 1}`}
                      className="rounded-xl aspect-video object-cover"
                    />
                  ))}
                </div>
              )}
              {post.image_urls.length >= 3 && (
                <>
                  <img
                    src={post.image_urls[0]}
                    alt={post.title}
                    className="w-full rounded-2xl aspect-video object-cover mb-3"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {post.image_urls.slice(1).map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`${post.title} ${idx + 2}`}
                        className="rounded-xl aspect-video object-cover"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Location Info */}
          {post.city && (
            <div className="flex items-center gap-2 text-xs text-[#8a7a6a] mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span>{post.city}</span>
            </div>
          )}
        </div>

        {/* Related Capsule Hint */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 mx-5 mb-4 rounded-2xl p-5">
          <div className="text-center">
            <div className="text-sm text-[#3a2a1a] mb-2">想去这个地方看看？</div>
            <p className="text-xs text-[#8a7a6a] leading-relaxed mb-4">
              也许在那里，你能找到更多故事
            </p>
            <PulseButton
              onClick={() => navigate("/yuan")}
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-400"
              glowColor="251, 146, 60"
            >
              去寻找胶囊
            </PulseButton>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-[#e5e1db] p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex-1 py-3 rounded-full text-sm flex items-center justify-center gap-2 transition-colors ${
              liked
                ? "bg-orange-50 text-orange-500"
                : "bg-[#f8f6f3] text-[#5a4a3a]"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${liked ? "fill-orange-400 text-orange-400" : ""}`}
            />
            <span>{liked ? "已喜欢" : "喜欢"}</span>
          </button>
          <button
            onClick={() => navigate("/yuan")}
            className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full text-sm"
          >
            去这里看看
          </button>
        </div>
      </div>
    </div>
  );
}
