import React from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export interface NewsItem {
    id: string;
    date: string;
    tag: string;
    title: string;
    description: string;
    imageUrl: string;
    isNew?: boolean;
}

interface NewsCardProps {
    news: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
    return (
        <Link href="/news/detail" className="group flex flex-col">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                {news.isNew && (
                    <div className="absolute right-4 top-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        NEW
                    </div>
                )}
                <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="space-y-3 mt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="bg-orange-50 text-orange-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {news.tag}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <CalendarDays className="size-3" />
                            <span>{news.date}</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-orange-500 transition-colors line-clamp-2">
                        {news.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500 line-clamp-3">
                        {news.description}
                    </p>
                </div>
                <div className="pt-4">
                    <span className="inline-block text-[11px] font-black tracking-wider uppercase text-slate-900 border-b-2 border-slate-900 pb-0.5 group-hover:text-orange-500 group-hover:border-orange-500 transition-all">
                        READ STORY
                    </span>
                </div>
            </div>
        </Link>
    );
};
