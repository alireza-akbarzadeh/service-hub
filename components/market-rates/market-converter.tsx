"use client"

import * as React from "react"
import { MarketAsset } from "./market-types"
import { formatNumberWithCommas, toPersianDigits } from "./market-data"
import { ArrowLeftRight, Calculator, Coins, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MarketConverterProps {
  asset: MarketAsset
  isPersian: boolean
  onTogglePersian: () => void
}

export function MarketConverter({ asset, isPersian }: MarketConverterProps) {
  const [inputVal, setInputVal] = React.useState<string>("100")
  const [isReverse, setIsReverse] = React.useState<boolean>(false)

  // Adjust default input when asset changes
  React.useEffect(() => {
    if (asset.id === "usd") {
      setInputVal(isReverse ? "10000000" : "100")
    } else if (asset.id === "gold18k") {
      setInputVal(isReverse ? "10000000" : "2.5")
    } else if (asset.id === "coin_emami") {
      setInputVal(isReverse ? "100000000" : "2")
    } else {
      setInputVal(isReverse ? "5000" : "1")
    }
  }, [asset.id, isReverse])

  const parsedInput = parseFloat(inputVal.replace(/,/g, "")) || 0

  // Calculate results based on direction
  const calculation = React.useMemo(() => {
    if (asset.id === "usd") {
      if (isReverse) {
        // Toman to USD
        const usdResult = parsedInput / asset.currentPrice
        const rialInput = parsedInput * 10
        return {
          primaryResult: `$${usdResult.toFixed(2)}`,
          primarySub: isPersian
            ? `با نرخ هر دلار ${formatNumberWithCommas(asset.currentPrice, true)} تومان`
            : `@ ${formatNumberWithCommas(asset.currentPrice, false)} Toman per USD`,
          secondary: isPersian
            ? `معادل ${formatNumberWithCommas(rialInput, true)} ریال`
            : `Equivalent to ${formatNumberWithCommas(rialInput, false)} Rials`,
        }
      } else {
        // USD to Toman
        const tomanResult = Math.round(parsedInput * asset.currentPrice)
        const rialResult = Math.round(tomanResult * 10)
        return {
          primaryResult: isPersian
            ? `${formatNumberWithCommas(tomanResult, true)} تومان`
            : `${formatNumberWithCommas(tomanResult, false)} Toman`,
          primarySub: isPersian
            ? `${formatNumberWithCommas(rialResult, true)} ریال ایران`
            : `${formatNumberWithCommas(rialResult, false)} Iranian Rials`,
          secondary: isPersian
            ? `بر پایه نرخ هر دلار ${formatNumberWithCommas(asset.currentPrice, true)} تومان`
            : `@ ${formatNumberWithCommas(asset.currentPrice, false)} Toman / USD`,
        }
      }
    }

    if (asset.id === "gold18k") {
      if (isReverse) {
        // Toman to Grams
        const gramsResult = (parsedInput / asset.currentPrice).toFixed(3)
        const mesghalResult = (parsedInput / (asset.currentPrice * 4.6083)).toFixed(3)
        return {
          primaryResult: isPersian
            ? `${toPersianDigits(gramsResult)} گرم طلای ۱۸ عیار`
            : `${gramsResult} Grams (18K)`,
          primarySub: isPersian
            ? `معادل ${toPersianDigits(mesghalResult)} مثقال طلا`
            : `Equivalent to ${mesghalResult} Mesghal`,
          secondary: isPersian
            ? `مظنه هر گرم: ${formatNumberWithCommas(asset.currentPrice, true)} تومان`
            : `@ ${formatNumberWithCommas(asset.currentPrice, false)} Toman / Gram`,
        }
      } else {
        // Grams to Toman
        const tomanResult = Math.round(parsedInput * asset.currentPrice)
        const rialResult = Math.round(tomanResult * 10)
        return {
          primaryResult: isPersian
            ? `${formatNumberWithCommas(tomanResult, true)} تومان`
            : `${formatNumberWithCommas(tomanResult, false)} Toman`,
          primarySub: isPersian
            ? `${formatNumberWithCommas(rialResult, true)} ریال ایران`
            : `${formatNumberWithCommas(rialResult, false)} Rials`,
          secondary: isPersian
            ? `برای ${toPersianDigits(parsedInput)} گرم طلای ۱۸ عیار`
            : `For ${parsedInput} Grams of 18K Gold`,
        }
      }
    }

    if (asset.id === "coin_emami") {
      if (isReverse) {
        const coinsResult = (parsedInput / asset.currentPrice).toFixed(2)
        return {
          primaryResult: isPersian
            ? `${toPersianDigits(coinsResult)} عدد سکه تمام`
            : `${coinsResult} Emami Coins`,
          primarySub: isPersian
            ? `هر سکه: ${formatNumberWithCommas(asset.currentPrice, true)} تومان`
            : `@ ${formatNumberWithCommas(asset.currentPrice, false)} Toman / Coin`,
          secondary: "",
        }
      } else {
        const tomanResult = Math.round(parsedInput * asset.currentPrice)
        return {
          primaryResult: isPersian
            ? `${formatNumberWithCommas(tomanResult, true)} تومان`
            : `${formatNumberWithCommas(tomanResult, false)} Toman`,
          primarySub: isPersian
            ? `${formatNumberWithCommas(tomanResult * 10, true)} ریال`
            : `${formatNumberWithCommas(tomanResult * 10, false)} Rials`,
          secondary: isPersian
            ? `قیمت ${toPersianDigits(parsedInput)} قطعه سکه بهار آزادی`
            : `Value of ${parsedInput} Coins`,
        }
      }
    }

    // Global Ounce
    if (isReverse) {
      const oz = (parsedInput / asset.currentPrice).toFixed(3)
      return {
        primaryResult: `${oz} Troy Ounces`,
        primarySub: `@ $${asset.currentPrice.toFixed(1)} / oz`,
        secondary: isPersian ? "اونس تروا طلای جهانی" : "Global Troy Ounce",
      }
    } else {
      const usdTotal = (parsedInput * asset.currentPrice).toFixed(2)
      return {
        primaryResult: `$${formatNumberWithCommas(usdTotal, false)}`,
        primarySub: `Total USD Value for ${parsedInput} oz`,
        secondary: isPersian
          ? `ارزش تقریبی به تومان: ${formatNumberWithCommas(Math.round(parsedInput * asset.currentPrice * 93450), true)} تومان`
          : `Toman Value: ~${formatNumberWithCommas(Math.round(parsedInput * asset.currentPrice * 93450), false)} Toman`,
      }
    }
  }, [asset, isReverse, parsedInput, isPersian])

  // Quick preset pills
  const presets = React.useMemo(() => {
    if (asset.id === "usd") {
      return isReverse
        ? [
            { label: "10M T", val: "10000000" },
            { label: "50M T", val: "50000000" },
            { label: "100M T", val: "100000000" },
          ]
        : [
            { label: "$10", val: "10" },
            { label: "$50", val: "50" },
            { label: "$100", val: "100" },
            { label: "$500", val: "500" },
            { label: "$1,000", val: "1000" },
          ]
    }
    if (asset.id === "gold18k") {
      return isReverse
        ? [
            { label: "5M T", val: "5000000" },
            { label: "10M T", val: "10000000" },
            { label: "50M T", val: "50000000" },
          ]
        : [
            { label: "1g", val: "1" },
            { label: "2.5g", val: "2.5" },
            { label: "5g", val: "5" },
            { label: "10g", val: "10" },
            { label: "1 مثقال (4.6g)", val: "4.608" },
          ]
    }
    return [
      { label: "1", val: "1" },
      { label: "2", val: "2" },
      { label: "5", val: "5" },
      { label: "10", val: "10" },
    ]
  }, [asset.id, isReverse])

  return (
    <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Calculator className="size-3.5 text-primary" />
          <span>{isPersian ? "ماشین‌حساب تبدیل زنده نرخ" : "Live Price & Currency Converter"}</span>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsReverse((prev) => !prev)}
          className="h-6 cursor-pointer gap-1 px-2 text-[10px] font-mono text-muted-foreground hover:text-foreground shadow-2xs"
          title="Reverse conversion direction"
        >
          <ArrowLeftRight className="size-3" />
          <span>{isReverse ? (isPersian ? "حالت عادی" : "Standard") : (isPersian ? "معکوس" : "Reverse")}</span>
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Input box */}
        <div>
          <label className="text-[11px] font-medium text-muted-foreground">
            {isReverse
              ? isPersian
                ? "مبلغ به تومان:"
                : "Amount in Toman:"
              : asset.id === "usd"
                ? isPersian
                  ? "مقدار دلار ($):"
                  : "Amount in USD ($):"
                : asset.id === "gold18k"
                  ? isPersian
                    ? "وزن طلا (گرم):"
                    : "Gold Weight (Grams):"
                  : isPersian
                    ? "تعداد:"
                    : "Quantity:"}
          </label>
          <div className="mt-1 relative">
            <Input
              type="number"
              min="0"
              step="any"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="h-9 font-mono text-sm pr-7"
              placeholder="0"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {isReverse ? "ت" : asset.id === "usd" ? "$" : "g"}
            </span>
          </div>

          {/* Quick presets */}
          <div className="mt-2 flex flex-wrap gap-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setInputVal(preset.val)}
                className="cursor-pointer rounded border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Calculation Result Card */}
        <div className="flex flex-col justify-center rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Coins className="size-3 text-amber-500" />
            <span>{isPersian ? "نتیجه تبدیل لحظه‌ای:" : "Converted Value:"}</span>
          </div>
          <div className="mt-1 font-mono text-base font-bold text-primary sm:text-lg">
            {calculation.primaryResult}
          </div>
          {calculation.primarySub && (
            <div className="font-mono text-xs text-muted-foreground">
              {calculation.primarySub}
            </div>
          )}
          {calculation.secondary && (
            <div className="mt-1 text-[10px] text-muted-foreground/80">
              {calculation.secondary}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
