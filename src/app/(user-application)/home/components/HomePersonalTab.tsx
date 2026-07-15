'use client';

import { Award, Hash, Trophy, Heart, Zap } from "lucide-react";
import { cn } from "utils/cn";
import Money from "../../components/preferences/Money";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import type { HomeDashboardData } from "./types";

type Props = {
    data: HomeDashboardData;
};

export default function HomePersonalTab({ data }: Props) {
    const { t } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();

    const punctualityPositive = data.punctualityScore > 0;
    const punctualityNegative = data.punctualityScore < 0;
    const punctualityLabel = punctualityPositive
        ? `+${formatNumber(data.punctualityScore)}`
        : formatNumber(data.punctualityScore);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    return (
        <div className="space-y-4">
            {/* Gamified Queue Visual */}
            {data.queue ? (() => {
                const isTop5 = data.queue.position <= 5;
                const members = data.queue.nearbyMembers || [];
                
                return (
                    <Card className="relative overflow-hidden transition-all bg-card border-border">
                        {isTop5 && (
                            <div className="absolute top-0 right-0 h-32 w-32 -mr-16 -mt-16 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                        )}
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                🚂 {t("home.queueWait")}
                                {isTop5 && <span className="text-xs font-bold text-amber-500 ml-auto animate-pulse">{t("home.queueAlmostThere")}</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-1 text-center">
                                    <span className={cn(
                                        "text-4xl font-black tracking-tighter drop-shadow-sm",
                                        isTop5 ? "text-amber-500 dark:text-amber-400" : "text-primary"
                                    )}>
                                        #{formatNumber(data.queue.position)}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t("home.queueProgress", { position: formatNumber(data.queue.position), total: formatNumber(data.queue.totalEligible) })}
                                    </span>
                                </div>
                                
                                {/* Vertical Journey Path */}
                                <div className="relative py-2 mx-auto max-w-[300px]">
                                    {/* The dashed path line */}
                                    <div className="absolute top-6 bottom-6 start-5 w-0 border-s-2 border-dashed border-border" />
                                    
                                    <div className="flex flex-col gap-6">
                                        {members.map((member) => {
                                            const isMe = member.isMe;
                                            return (
                                                <div key={member.userId} className={cn("relative flex items-center gap-4 transition-all", isMe ? "scale-[1.02] z-10" : "opacity-80")}>
                                                    {/* Avatar & Rank */}
                                                    <div className="relative shrink-0 flex justify-center w-10">
                                                        {isMe && <div className="absolute -inset-1.5 rounded-full bg-amber-500/20 animate-pulse" />}
                                                        <Avatar className={cn(
                                                            "border-2 transition-all shadow-sm z-10", 
                                                            isMe ? "h-14 w-14 ring-4 ring-background" : "h-10 w-10 bg-background"
                                                        )} style={{ borderColor: member.profileColor || undefined }}>
                                                            <AvatarImage src={member.avatar ?? ""} />
                                                            <AvatarFallback className={isMe ? "text-sm" : "text-xs"}>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className={cn(
                                                            "absolute -bottom-1 -end-1 flex items-center justify-center rounded-full font-black shadow-sm text-background z-20",
                                                            isMe ? "h-6 w-6 bg-amber-500 text-xs ring-2 ring-background" : "h-5 w-5 bg-muted-foreground text-[10px] ring-1 ring-background"
                                                        )}>
                                                            {formatNumber(member.position)}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Name & Bubble */}
                                                    <div className={cn(
                                                        "flex-1 rounded-xl px-4 py-2.5 shadow-sm border text-start min-w-0",
                                                        isMe 
                                                            ? "bg-linear-to-r from-amber-500 to-amber-600 border-amber-600 text-white dark:from-amber-500/20 dark:to-amber-600/10 dark:border-amber-500/30 dark:text-amber-100" 
                                                            : "bg-background border-border text-foreground"
                                                    )}>
                                                        <span className={cn(
                                                            "text-sm block truncate", 
                                                            isMe ? "font-bold" : "font-medium"
                                                        )}>
                                                            {member.firstName} {isMe && <span className="opacity-80 text-xs">{t("home.you")}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })() : null}

            {/* Gamified Lightning Payer Podium */}
            {data.monthlyPodium && data.monthlyPodium.topUsers.length > 0 && (
                <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/5 to-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base text-blue-600 dark:text-blue-400">
                            <Zap className="h-4 w-4" />
                            {t("home.podiumTitle", { month: formatNumber(data.monthlyPodium.month) })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-center gap-4 pt-4">
                            {/* Rank 2 */}
                            {data.monthlyPodium.topUsers[1] && (
                                <div className="flex flex-col items-center gap-1 opacity-90">
                                    <Avatar className="h-10 w-10 border-2 border-slate-300">
                                        <AvatarImage src={data.monthlyPodium.topUsers[1].avatar ?? ""} />
                                        <AvatarFallback>{getInitials(data.monthlyPodium.topUsers[1].firstName, data.monthlyPodium.topUsers[1].lastName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium truncate max-w-[60px]">{data.monthlyPodium.topUsers[1].firstName}</span>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-t-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold shadow-inner">
                                        {formatNumber(2)}
                                    </div>
                                </div>
                            )}
                            
                            {/* Rank 1 */}
                            {data.monthlyPodium.topUsers[0] && (
                                <div className="flex flex-col items-center gap-1 z-10">
                                    <div className="relative">
                                        <span className="absolute -top-3 -right-2 text-lg">👑</span>
                                        <Avatar className="h-14 w-14 border-4 border-amber-400 shadow-md">
                                            <AvatarImage src={data.monthlyPodium.topUsers[0].avatar ?? ""} />
                                            <AvatarFallback>{getInitials(data.monthlyPodium.topUsers[0].firstName, data.monthlyPodium.topUsers[0].lastName)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <span className="text-sm font-bold truncate max-w-[80px]">{data.monthlyPodium.topUsers[0].firstName}</span>
                                    <div className="flex h-16 w-14 items-center justify-center rounded-t-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-lg font-black shadow-inner">
                                        {formatNumber(1)}
                                    </div>
                                </div>
                            )}

                            {/* Rank 3 */}
                            {data.monthlyPodium.topUsers[2] && (
                                <div className="flex flex-col items-center gap-1 opacity-80">
                                    <Avatar className="h-10 w-10 border-2 border-amber-700/50">
                                        <AvatarImage src={data.monthlyPodium.topUsers[2].avatar ?? ""} />
                                        <AvatarFallback>{getInitials(data.monthlyPodium.topUsers[2].firstName, data.monthlyPodium.topUsers[2].lastName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium truncate max-w-[60px]">{data.monthlyPodium.topUsers[2].firstName}</span>
                                    <div className="flex h-10 w-12 items-center justify-center rounded-t-md bg-amber-900/10 dark:bg-amber-900/30 text-amber-800 dark:text-amber-600 font-bold shadow-inner">
                                        {formatNumber(3)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
            {data.loanRanking ? (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Hash className="h-4 w-4 text-primary" />
                            {t("home.loanRanking")}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{t("home.loanRankingDesc")}</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-primary/10 to-transparent px-3.5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary/80">
                                {t("home.rankingByCount")}
                            </p>
                            <p className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
                                {t("home.rankingPosition", {
                                    position: formatNumber(data.loanRanking.byCount.position),
                                    total: formatNumber(data.loanRanking.byCount.totalUsers),
                                })}
                            </p>
                            <p className="mt-1 font-medium text-xs text-muted-foreground">
                                {t("home.rankingLoanCount", {
                                    count: formatNumber(data.loanRanking.byCount.loanCount),
                                })}
                            </p>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-bl from-primary/10 to-transparent px-3.5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary/80">
                                {t("home.rankingByAmount")}
                            </p>
                            <p className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
                                {t("home.rankingPosition", {
                                    position: formatNumber(data.loanRanking.byAmount.position),
                                    total: formatNumber(data.loanRanking.byAmount.totalUsers),
                                })}
                            </p>
                            <p className="mt-1 font-medium text-xs text-muted-foreground">
                                <Money value={data.loanRanking.byAmount.loanAmount} />
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-4 w-4 text-primary" />
                        {t("home.achievements")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Good Karma */}
                    {data.goodKarma > 0 && (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{t("home.goodKarma")}</p>
                                <p className="text-xs text-muted-foreground">{t("home.goodKarmaHint")}</p>
                            </div>
                            <Badge className="shrink-0 px-2.5 py-1 text-sm font-bold tabular-nums border-rose-500/40 bg-rose-500/10 text-rose-600">
                                <Heart className="me-1 inline h-3.5 w-3.5 fill-current" />
                                {formatNumber(data.goodKarma)}
                            </Badge>
                        </div>
                    )}

                    {/* Fastest Payer Reward */}
                    {data.fastestPayerRewards > 0 && (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-blue-500/20 bg-blue-500/5 px-3 py-2">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t("home.lightningPayer")}</p>
                                <p className="text-xs text-muted-foreground">{t("home.lightningPayerHint")}</p>
                            </div>
                            <Badge className="shrink-0 px-2.5 py-1 text-sm font-bold border-blue-500/40 bg-blue-500/10 text-blue-600 whitespace-nowrap">
                                {t("home.lightningPayerReward", { count: formatNumber(data.fastestPayerRewards) })}
                            </Badge>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">{t("home.punctualityScore")}</p>
                            <p className="text-xs text-muted-foreground">{t("home.punctualityHint")}</p>
                        </div>
                        <Badge
                            className={cn(
                                "shrink-0 px-2.5 py-1 text-sm font-bold tabular-nums",
                                punctualityPositive && "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
                                punctualityNegative && "border-rose-500/40 bg-rose-500/10 text-rose-600",
                                !punctualityPositive && !punctualityNegative && "border-border bg-muted/40 text-muted-foreground",
                            )}
                        >
                            <Award className="me-1 inline h-3.5 w-3.5" />
                            {punctualityLabel}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
