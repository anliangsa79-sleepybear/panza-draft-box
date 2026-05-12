"use client";

import { useState } from "react";

type Post = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
};

const initialPosts: Post[] = [
  {
    id: 1,
    title: "第一篇草稿：潘沙的草稿箱开张",
    excerpt: "这是一个可以写文章、加标签、切换前后台的个人网站雏形。",
    content:
      "这里是正文。后面我们会继续升级：连接数据库、上传 doc/docx、自动排版、登录后台。",
    tags: ["随笔", "草稿箱"],
    status: "published",
  },
  {
    id: 2,
    title: "一篇未发布的草稿",
    excerpt: "这篇文章只在后台可见。",
    content: "这是草稿内容。",
    tags: ["未发布", "想法"],
    status: "draft",
  },
];

export default function Home() {
  const [mode, setMode] = useState<"front" | "admin">("front");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [current, setCurrent] = useState<Post | null>(null);

  const [editingId, setEditingId] = useState<number>(1);
  const editingPost = posts.find((p) => p.id === editingId) || posts[0];

  const [title, setTitle] = useState(editingPost.title);
  const [excerpt, setExcerpt] = useState(editingPost.excerpt);
  const [content, setContent] = useState(editingPost.content);
  const [tags, setTags] = useState(editingPost.tags.join("，"));

  function loadPost(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setTags(post.tags.join("，"));
  }

  function savePost(status: "draft" | "published") {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              title,
              excerpt,
              content,
              status,
              tags: tags
                .split(/[，,]/)
                .map((t) => t.trim())
                .filter(Boolean),
            }
          : p
      )
    );
    alert(status === "published" ? "已发布" : "已保存草稿");
  }

  function createPost() {
    const newPost: Post = {
      id: Date.now(),
      title: "新文章标题",
      excerpt: "这里写摘要。",
      content: "这里写正文。",
      tags: ["新文章"],
      status: "draft",
    };
    setPosts([newPost, ...posts]);
    loadPost(newPost);
  }

  function formatText(type: "bold" | "quote" | "orange" | "blue" | "section") {
    if (type === "bold") setContent(content + "\n\n**加粗文字**");
    if (type === "quote") setContent(content + "\n\n> 这里是一段引用");
    if (type === "orange") setContent(content + "\n\n【橙色标记】重点内容");
    if (type === "blue") setContent(content + "\n\n【蓝色标记】重点内容");
    if (type === "section") setContent(content + "\n\n## 小标题\n\n这里写新的段落。");
  }

  if (current) {
    return (
      <main className="min-h-screen bg-[#f6f2ea] text-slate-900">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <button
            onClick={() => setCurrent(null)}
            className="mb-8 text-sm text-blue-700"
          >
            ← 返回首页
          </button>

          <div className="mb-6 flex gap-2">
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-blue-950">
            {current.title}
          </h1>
          <p className="mt-5 text-lg text-slate-600">{current.excerpt}</p>

          <article className="mt-10 whitespace-pre-line rounded-3xl bg-white p-8 leading-8 shadow-sm">
            {current.content}
          </article>
        </div>
      </main>
    );
  }

  if (mode === "admin") {
    return (
      <main className="min-h-screen bg-[#f6f2ea] text-slate-900">
        <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
          <aside className="bg-blue-950 p-6 text-white">
            <h1 className="text-2xl font-bold">潘沙的草稿箱</h1>
            <p className="mt-2 text-sm text-blue-100">后台管理</p>

            <button
              onClick={() => setMode("front")}
              className="mt-6 w-full rounded-full bg-orange-500 px-4 py-3 font-semibold text-white"
            >
              返回前台
            </button>

            <button
              onClick={createPost}
              className="mt-3 w-full rounded-full bg-white px-4 py-3 font-semibold text-blue-950"
            >
              新建文章
            </button>

            <div className="mt-8 space-y-2">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => loadPost(post)}
                  className={`w-full rounded-2xl p-3 text-left text-sm ${
                    post.id === editingId
                      ? "bg-white text-blue-950"
                      : "bg-blue-900 text-white"
                  }`}
                >
                  <div className="font-semibold">{post.title}</div>
                  <div className="mt-1 text-xs opacity-70">
                    {post.status === "published" ? "已发布" : "草稿"}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="p-6 md:p-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-blue-950">文章编辑</h2>
              <p className="mt-2 text-slate-500">
                现在是本地演示版，下一步会接 Supabase 数据库。
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <label className="text-sm text-slate-500">标题</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full border-b border-slate-200 pb-3 text-3xl font-bold outline-none"
                />

                <label className="mt-6 block text-sm text-slate-500">
                  摘要
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-slate-50 p-4 outline-none"
                  rows={3}
                />

                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={() => formatText("bold")} className="btn">
                    加粗
                  </button>
                  <button onClick={() => formatText("quote")} className="btn">
                    引用
                  </button>
                  <button onClick={() => formatText("orange")} className="btn">
                    橙色标记
                  </button>
                  <button onClick={() => formatText("blue")} className="btn">
                    蓝色标记
                  </button>
                  <button onClick={() => formatText("section")} className="btn">
                    分段/小标题
                  </button>
                </div>

                <label className="mt-6 block text-sm text-slate-500">
                  正文
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-slate-50 p-5 leading-8 outline-none"
                  rows={18}
                />
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <label className="text-sm text-slate-500">TAG</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-2 w-full rounded-2xl bg-slate-50 p-3 outline-none"
                    placeholder="随笔，历史，AI"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    用中文逗号或英文逗号分隔。
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <button
                    onClick={() => savePost("draft")}
                    className="w-full rounded-full border border-blue-900 px-4 py-3 font-semibold text-blue-950"
                  >
                    保存草稿
                  </button>
                  <button
                    onClick={() => savePost("published")}
                    className="mt-3 w-full rounded-full bg-orange-500 px-4 py-3 font-semibold text-white"
                  >
                    发布文章
                  </button>
                </div>
              </aside>
            </div>
          </section>
        </div>

        <style jsx>{`
          .btn {
            border-radius: 999px;
            background: #eff6ff;
            color: #1e3a8a;
            padding: 8px 14px;
            font-size: 14px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-950">潘沙的草稿箱</h1>
          <p className="mt-1 text-sm text-slate-500">
            写作、资料、想法和未完成的句子
          </p>
        </div>

        <button
          onClick={() => setMode("admin")}
          className="rounded-full bg-blue-950 px-5 py-3 font-semibold text-white"
        >
          进入后台
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-[36px] bg-blue-950 p-10 text-white md:p-16">
          <p className="text-orange-300">PANZA DRAFT BOX</p>
          <h2 className="mt-4 max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
            把草稿、资料和灵感，慢慢整理成文章。
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts
            .filter((p) => p.status === "published")
            .map((post) => (
              <article
                key={post.id}
                onClick={() => setCurrent(post)}
                className="cursor-pointer rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-blue-950">
                  {post.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {post.excerpt}
                </p>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
