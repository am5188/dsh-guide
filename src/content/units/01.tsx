import type { UnitContent } from "../types";
import { Unit01Anim } from "@/components/anim/Unit01Anim";
import { SplitAnim } from "@/components/anim/diagrams";

const theory = (
  <div className="prose-cn">
    <p>
      大模型是一台<strong>文字接龙机器</strong>
      ：你给它一段文字，它算出“接下来最该出现的字是什么”，然后一个接一个地写下去。
      它写得又快又好，但请记住这句话——
      <strong>它从头到尾只做这一件事</strong>
      。它能做什么、不能做什么，全都是这一件事的推论。
    </p>

    <SplitAnim
      left={{
        title: "它真的擅长的",
        items: [
          "把一段话写清楚、写好看",
          "把长的缩短、把短的扩写",
          "翻译、改写语气、换文体",
          "按你给的格式整理内容",
          "解释一个概念给你听",
        ],
      }}
      right={{
        title: "做不到、却常装作能做到",
        items: [
          "说出你电脑里有哪些文件",
          "读你刚做的那个 Excel",
          "知道你公司内部的规定",
          "查到今天的实时价格",
          "替你把文件真的改掉",
        ],
      }}
    />

    <h3>为什么？因为它没有眼睛，也没有手</h3>
    <p>
      它没有屏幕可以看，没有键盘可以敲，没有硬盘可以读。它唯一拥有的，就是你
      <strong>这一次</strong>
      发给它的那段文字。所以当它被问到自己不可能知道的事，它不会说“我不知道”——
      它会顺着话头，接出一段听起来很合理的文字。这个现象有名字，叫
      <strong>幻觉</strong>，而且它不是 bug，是这台机器的工作原理本身。
    </p>

    <div className="my-9 rounded-lg bg-surface p-6">
      <div className="text-body-sm font-semibold">
        请记住这三个词，后面每一节都会用到
      </div>
      <dl className="mt-5 space-y-4">
        {[
          ["写完就忘", "这一次说完，它不记得。所以你问两遍，它当两件事。"],
          ["碰不到东西", "它只能输出文字，不能真的打开、修改、发送。"],
          ["会补全，不会承认", "缺什么它就顺着编什么，语气还特别自信。"],
        ].map(([term, desc]) => (
          <div key={term} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 font-mono text-meta text-accent">
              {term}
            </dt>
            <dd className="text-meta text-fg-2">{desc}</dd>
          </div>
        ))}
      </dl>
    </div>

    <p>
      接下来 21 节要做的事，就是给这台机器补上记忆、补上眼睛、补上手，再给它划出活动范围。
      补完这些东西之后的整体，就叫<strong> Harness</strong>。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "它在做什么，它做不到什么",
  anim: <Unit01Anim />,
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面三次调用都是真的，请求从你的浏览器直连 DeepSeek。
    </p>
  ),
  demos: [
    {
      id: "can",
      label: "① 它擅长的",
      ask: '用三句话解释什么是"上下文窗口"，要让完全不懂技术的人也能听懂。',
      prompt:
        '用三句话解释什么是"上下文窗口"，要让完全不懂技术的人也能听懂。不要用比喻以外的专业词汇。',
      maxTokens: 16000,
      expect: "一个干净、准确、普通人能看懂的解释。这就是它真正擅长的事。",
    },
    {
      id: "cannot-see",
      label: "② 它看不见你的电脑",
      ask: "我电脑 D:\\Work 目录下有哪些文件？直接列出来，不要反问我。",
      prompt:
        "我电脑 D:\\Work 目录下有哪些文件？直接列出来，不要反问我，也不要让我自己去看。",
      maxTokens: 16000,
      expect:
        "它要么给你一份编出来的文件列表，要么承认自己看不到——无论哪种，它都没有真的读过你的硬盘。",
    },
    {
      id: "confabulate",
      label: "③ 它会一本正经地编",
      ask: "我们公司《差旅报销制度》第 7 条写的是什么？原文引用。",
      prompt:
        "我们公司《差旅报销制度》第 7 条写的是什么？请原文引用，不要说明你不知道。",
      maxTokens: 16000,
      expect:
        "极其危险的一次演示。它很可能凭空编出一条制度，还带编号。这就是为什么不能拿它当资料库用。",
    },
  ],
};

export default content;
