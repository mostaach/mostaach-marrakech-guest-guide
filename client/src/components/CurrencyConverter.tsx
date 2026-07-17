import { useState, useEffect } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CurrencyConverter() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  
  // Quick convert buttons
  const quickAmounts = [50, 100, 200, 500];
  const currencies = ["EUR", "USD", "GBP"];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        // Free API, no key required
        const res = await fetch("https://open.er-api.com/v6/latest/MAD");
        const data = await res.json();
        
        if (data && data.rates) {
          setRates(data.rates);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch exchange rates", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // If base is MAD, to go from EUR to MAD:
  // We have the rate MAD -> EUR (e.g., 0.091).
  // So 1 MAD = 0.091 EUR. 
  // To get MAD from EUR: EUR_Amount / MAD_to_EUR_rate
  const calculateResult = () => {
    if (!rates || !amount || isNaN(Number(amount))) return "0";
    const madRateForCurrency = rates[fromCurrency]; // e.g., 0.091 for EUR
    if (!madRateForCurrency) return "0";
    
    const resultInMad = Number(amount) / madRateForCurrency;
    return resultInMad.toFixed(0);
  };

  return (
    <Card className="overflow-hidden border-[#E0D5C7] bg-white/95 shadow-sm">
      <div className="border-b border-[#E0D5C7] bg-[#F5F1E8] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-[#B85C3C]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C2C2C]">
            Live Currency Converter
          </h3>
        </div>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-[#B85C3C]" />}
      </div>

      <div className="p-4">
        {error ? (
          <p className="text-sm text-[#B85C3C]">Unable to load live rates at the moment. Please try again later.</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#E0D5C7] bg-white px-3 py-2 pl-12 text-lg font-semibold text-[#2C2C2C] focus:border-[#B85C3C] focus:outline-none focus:ring-1 focus:ring-[#B85C3C]"
                  placeholder="0"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="absolute left-1 top-1 bottom-1 bg-transparent px-2 font-bold text-[#6B6B6B] focus:outline-none appearance-none"
                >
                  {currencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="text-center text-[#8B9D83] font-bold px-2">
                =
              </div>

              <div className="relative flex-1">
                <div className="w-full rounded-lg border border-[#E0D5C7] bg-[#F5F1E8] px-3 py-2 text-lg font-semibold text-[#B85C3C] flex items-center justify-between">
                  <span>{loading ? "..." : calculateResult()}</span>
                  <span className="text-xs text-[#6B6B6B] font-bold">MAD</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="flex-1 rounded-md bg-[#F5F1E8] py-1.5 text-xs font-semibold text-[#2C2C2C] hover:bg-[#E0D5C7] transition-colors"
                >
                  {amt} {fromCurrency}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
