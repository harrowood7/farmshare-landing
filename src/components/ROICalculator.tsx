import React, { useState } from 'react';
import { Calculator, Clock, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function ROICalculator() {
  const [weeklyHead, setWeeklyHead] = useState<number>(20);
  const [revenuePerHead, setRevenuePerHead] = useState<number>(500);
  const [isCalculated, setIsCalculated] = useState(false);

  // ROI Model — matches demo narrative
  // 30 min saved per beef head on admin time
  const minutesSavedPerHead = 30;
  // 5% throughput increase from reduced no-shows, waitlist fills, fewer cancellations
  const throughputIncrease = 0.05;

  const weeklyMinutesSaved = weeklyHead * minutesSavedPerHead;
  const weeklyHoursSaved = weeklyMinutesSaved / 60;
  const monthlyHoursSaved = weeklyHoursSaved * 4.33;
  const yearlyHoursSaved = weeklyHoursSaved * 52;

  const additionalWeeklyHead = Math.round(weeklyHead * throughputIncrease * 10) / 10;
  const additionalWeeklyRevenue = additionalWeeklyHead * revenuePerHead;
  const additionalMonthlyRevenue = additionalWeeklyRevenue * 4.33;
  const additionalYearlyRevenue = additionalWeeklyRevenue * 52;

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const formatNumber = (n: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(n));
  };

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  };

  return (
    <section className="py-20 bg-white" id="roi-calculator">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-4xl font-roca text-brand-green mb-4">What Could Farmshare Save You?</h2>
            <p className="text-xl text-stone-600">Enter your numbers. See the impact in seconds.</p>
          </div>

          <div className="bg-brand-cream rounded-2xl p-8 md:p-12 shadow-lg fade-up">
            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-bold text-brand-green mb-2 uppercase tracking-wide">
                  Weekly Head Count
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={weeklyHead}
                    onChange={(e) => {
                      setWeeklyHead(Math.max(1, parseInt(e.target.value) || 1));
                      setIsCalculated(false);
                    }}
                    className="w-full px-4 py-4 text-2xl font-bold text-brand-green bg-white rounded-lg border-2 border-stone-200 focus:border-brand-orange focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 text-sm">head / week</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={Math.min(weeklyHead, 200)}
                  onChange={(e) => {
                    setWeeklyHead(parseInt(e.target.value));
                    setIsCalculated(false);
                  }}
                  className="w-full mt-3 accent-brand-orange h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-green mb-2 uppercase tracking-wide">
                  Average Revenue Per Head
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-stone-400" />
                  <input
                    type="number"
                    min={100}
                    max={5000}
                    value={revenuePerHead}
                    onChange={(e) => {
                      setRevenuePerHead(Math.max(100, parseInt(e.target.value) || 100));
                      setIsCalculated(false);
                    }}
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-brand-green bg-white rounded-lg border-2 border-stone-200 focus:border-brand-orange focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 text-sm">per head</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={Math.min(revenuePerHead, 2000)}
                  onChange={(e) => {
                    setRevenuePerHead(parseInt(e.target.value));
                    setIsCalculated(false);
                  }}
                  className="w-full mt-3 accent-brand-orange h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>$100</span>
                  <span>$500</span>
                  <span>$1,000</span>
                  <span>$1,500</span>
                  <span>$2,000+</span>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            {!isCalculated && (
              <div className="text-center mb-8">
                <button
                  onClick={handleCalculate}
                  className="bg-brand-orange text-white text-lg px-10 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate My ROI
                </button>
              </div>
            )}

            {/* Results */}
            {isCalculated && (
              <div className="animate-fadeIn">
                <div className="border-t-2 border-stone-200 pt-8 mb-8">
                  <h3 className="text-xl font-bold text-brand-green text-center mb-6">Your Estimated Farmshare Impact</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Time Saved */}
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-brand-green">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-brand-green/10 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-brand-green" />
                      </div>
                      <h4 className="text-lg font-bold text-brand-green">Admin Time Saved</h4>
                    </div>
                    <p className="text-sm text-stone-500 mb-4">
                      {minutesSavedPerHead} minutes saved per head on scheduling, cut sheet collection, and communication
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-600">Per week</span>
                        <span className="text-2xl font-bold text-brand-green">{weeklyHoursSaved.toFixed(1)} hrs</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-600">Per month</span>
                        <span className="text-2xl font-bold text-brand-green">{monthlyHoursSaved.toFixed(0)} hrs</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-stone-100 pt-3">
                        <span className="text-stone-600 font-medium">Per year</span>
                        <span className="text-3xl font-bold text-brand-green">{formatNumber(yearlyHoursSaved)} hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Gained */}
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-brand-orange">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-brand-orange/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-brand-orange" />
                      </div>
                      <h4 className="text-lg font-bold text-brand-green">Additional Revenue</h4>
                    </div>
                    <p className="text-sm text-stone-500 mb-4">
                      5% throughput increase from fewer no-shows, waitlist fills, and better scheduling
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-600">Extra head / week</span>
                        <span className="text-2xl font-bold text-brand-orange">+{additionalWeeklyHead}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-600">Per month</span>
                        <span className="text-2xl font-bold text-brand-orange">{formatCurrency(additionalMonthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-stone-100 pt-3">
                        <span className="text-stone-600 font-medium">Per year</span>
                        <span className="text-3xl font-bold text-brand-orange">{formatCurrency(additionalYearlyRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="bg-brand-green rounded-xl p-6 text-center">
                  <p className="text-brand-cream/80 mb-2">
                    That's <span className="text-white font-bold">{formatNumber(yearlyHoursSaved)} hours</span> and up to <span className="text-white font-bold">{formatCurrency(additionalYearlyRevenue)}</span> back in your pocket every year.
                  </p>
                  <p className="text-white text-lg font-bold mb-4">See it in action—most demos take 30 minutes.</p>
                  <a 
                    href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-orange text-white text-lg px-8 py-3 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule a Demo
                  </a>
                </div>

                {/* Recalculate */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => setIsCalculated(false)}
                    className="text-stone-500 hover:text-brand-orange text-sm font-medium underline"
                  >
                    Adjust numbers and recalculate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Methodology note */}
          <p className="text-center text-sm text-stone-400 mt-6">
            Estimates based on averages across 30+ processors on the Farmshare network. Actual results vary by operation size, species mix, and workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
