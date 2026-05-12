"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Post = {
  id: number;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  tags: string[] | null;
  status: "draft" | "published" | string | null;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
};

export default function Home() {
  const [mode, setMode] = useState<"front" | "admin">("front");
  const [posts, setPosts] = useState<Post[]>([]);
  const [current, setCurrent] = useState<Post | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  async function loadPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("读取文章失败：" + error.message);
      return;
    }

    setPosts(data || []);

    if (data && data.length > 0 && editingId === null) {
      loadPost(data[0]);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function loadPost(post: Post) {
    setEditingId(post.id);
    setTitle(post.title || "");
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setTags((post.tags || []).join("，"));
  }

  async function createPost() {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: "新文章标题",
        excerpt: "这里写摘要。",
        content: "这里写正文。",
        tags: ["新文章"],
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      alert("新建失败：" + error.message);
      return;
    }

    await loadPosts();
    loadPost(data);
  }

  async function savePost(status: "draft" | "published") {
    if (!editingId) {
      alert("请先选择一篇文章");
      return;
    }

    const cleanTags = tags
      .split(/[，,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        excerpt,
        content,
        tags: cleanTags,
        status,
        updated_at: new Date().toISOString(),
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", editingId);

    if (error) {
      alert("保存失败：" + error.message);
      return;
    }

    alert(status === "published" ? "已发布到数据库" : "草稿已保存到数据库");
    await loadPosts();
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
          <button onClick={() => setCurrent(null)} className="mb-8 text-sm text-blue-700">
            ← 返回首页
          </button>

          <div className="mb-6 flex gap-2">
            {(current.tags || []).map((tag) => (
              <span key={tag} className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
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

            <button onClick={() => setMode("front")} className="mt-6 w-full rounded-full bg-orange-500 px-4 py-3 font-semibold text-white">
              返回前台
            </button>

            <button onClick={createPost} className="mt-3 w-full rounded-full bg-white px-4 py-3 font-semibold text-blue-950">
              新建文章
            </button>

            <div className="mt-8 space-y-2">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => loadPost(post)}
                  className={`w-full rounded-2xl p-3 text-left text-sm ${
                    post.id === editingId ? "bg-white text-blue-950" : "bg-blue-900 text-white"
                  }`}
                >
                  <div className="font-semibold">{post.title || "未命名文章"}</div>
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
                当前版本已接入 Supabase，保存和发布会写入数据库。
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <label className="text-sm text-slate-500">标题</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full border-b border-slate-200 pb-3 text-3xl font-bold outline-none" />

                <label className="mt-6 block text-sm text-slate-500">摘要</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-2 w-full rounded-2xl bg-slate-50 p-4 outline-none" rows={3} />

                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={() => formatText("bold")} className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-900">加粗</button>
                  <button onClick={() => formatText("quote")} className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-900">引用</button>
                  <button onClick={() => formatText("orange")} className="rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-700">橙色标记</button>
                  <button onClick={() => formatText("blue")} className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700">蓝色标记</button>
                  <button onClick={() => formatText("section")} className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-900">分段/小标题</button>
                </div>

                <label className="mt-6 block text-sm text-slate-500">正文</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-2 w-full rounded-2xl bg-slate-50 p-5 leading-8 outline-none" rows={18} />
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <label className="text-sm text-slate-500">TAG</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-2 w-full rounded-2xl bg-slate-50 p-3 outline-none" placeholder="随笔，历史，AI" />
                  <p className="mt-2 text-xs text-slate-400">用中文逗号或英文逗号分隔。</p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <button onClick={() => savePost("draft")} className="w-full rounded-full border border-blue-900 px-4 py-3 font-semibold text-blue-950">
                    保存草稿
                  </button>
                  <button onClick={() => savePost("published")} className="mt-3 w-full rounded-full bg-orange-500 px-4 py-3 font-semibold text-white">
                    发布文章
                  </button>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const publishedPosts = posts.filter((p) => p.status === "published");

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-950">潘沙的草稿箱</h1>
          <p className="mt-1 text-sm text-slate-500">写作、资料、想法和未完成的句子</p>
        </div>

        <button onClick={() => setMode("admin")} className="rounded-full bg-blue-950 px-5 py-3 font-semibold text-white">
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
          {publishedPosts.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-slate-500 shadow-sm">
              还没有发布文章。进入后台新建一篇并发布。
            </div>
          ) : (
            publishedPosts.map((post) => (
              <article key={post.id} onClick={() => setCurrent(post)} className="cursor-pointer rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-5 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100" />
                <div className="flex flex-wrap gap-2">
                  {(post.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-blue-950">{post.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{post.excerpt}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
