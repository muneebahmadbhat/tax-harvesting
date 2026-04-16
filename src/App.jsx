import { useEffect, useState } from "react";
import { getHoldings, getCapitalGains } from "./services/mockApi";

function App() {
  const [holdings, setHoldings] = useState([]);
  const [capitalGains, setCapitalGains] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoins, setSelectedCoins] = useState([]);

  const stcg = capitalGains?.capitalGains?.stcg;
  const ltcg = capitalGains?.capitalGains?.ltcg;

  const netSTCG = stcg ? stcg.profits - stcg.losses : 0;
  const netLTCG = ltcg ? ltcg.profits - ltcg.losses : 0;
  const realisedGains = netSTCG + netLTCG;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const holdingsRes = await getHoldings();
        const gainsRes = await getCapitalGains();

        setHoldings(holdingsRes);
        setCapitalGains(gainsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <h1 className="text-xl">Loading...</h1>;
  }

  // Selection logic
  const handleSelect = (index) => {
    setSelectedCoins((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const allSelected = selectedCoins.length === holdings.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCoins([]);
    } else {
      setSelectedCoins(holdings.map((_, index) => index));
    }
  };

  //  Selected data
  const selectedData = holdings.filter((_, index) =>
    selectedCoins.includes(index),
  );

  let selectedSTCGProfit = 0;
  let selectedSTCGLoss = 0;
  let selectedLTCGProfit = 0;
  let selectedLTCGLoss = 0;

  selectedData.forEach((item) => {
    if (item.stcg.gain >= 0) {
      selectedSTCGProfit += item.stcg.gain;
    } else {
      selectedSTCGLoss += Math.abs(item.stcg.gain);
    }

    if (item.ltcg.gain >= 0) {
      selectedLTCGProfit += item.ltcg.gain;
    } else {
      selectedLTCGLoss += Math.abs(item.ltcg.gain);
    }
  });

  //  After harvesting values
  const afterSTCGProfit = (stcg?.profits || 0) + selectedSTCGProfit;
  const afterSTCGLoss = (stcg?.losses || 0) + selectedSTCGLoss;

  const afterLTCGProfit = (ltcg?.profits || 0) + selectedLTCGProfit;
  const afterLTCGLoss = (ltcg?.losses || 0) + selectedLTCGLoss;

  const afterSTCGNet = afterSTCGProfit - afterSTCGLoss;
  const afterLTCGNet = afterLTCGProfit - afterLTCGLoss;

  const afterRealised = afterSTCGNet + afterLTCGNet;

  //  Savings
  const savings = realisedGains - afterRealised;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tax Harvesting</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre */}
        <div className="bg-gray-900 text-white p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Pre Harvesting</h2>

          <div className="space-y-2">
            <div>
              <p>Short Term</p>
              <p>Profit: ₹{stcg?.profits}</p>
              <p>Loss: ₹{stcg?.losses}</p>
              <p>Net: ₹{netSTCG}</p>
            </div>

            <div className="mt-4">
              <p>Long Term</p>
              <p>Profit: ₹{ltcg?.profits}</p>
              <p>Loss: ₹{ltcg?.losses}</p>
              <p>Net: ₹{netLTCG}</p>
            </div>

            <div className="mt-4 font-bold">
              Realised Gains: ₹{realisedGains.toFixed(2)}
            </div>
          </div>
        </div>

        {/* After */}
        <div className="bg-blue-500 text-white p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">After Harvesting</h2>

          <div className="space-y-2">
            <div>
              <p>Short Term</p>
              <p>Profit: ₹{afterSTCGProfit.toFixed(2)}</p>
              <p>Loss: ₹{afterSTCGLoss.toFixed(2)}</p>
              <p
                className={
                  afterSTCGNet >= 0 ? "text-green-200" : "text-red-200"
                }
              >
                Net: ₹{afterSTCGNet.toFixed(2)}
              </p>
            </div>

            <div className="mt-4">
              <p>Long Term</p>
              <p>Profit: ₹{afterLTCGProfit.toFixed(2)}</p>
              <p>Loss: ₹{afterLTCGLoss.toFixed(2)}</p>
              <p
                className={
                  afterLTCGNet >= 0 ? "text-green-200" : "text-red-200"
                }
              >
                Net: ₹{afterLTCGNet.toFixed(2)}
              </p>
            </div>

            <div className="mt-4 font-bold">
              Realised Gains: ₹{afterRealised.toFixed(2)}
            </div>

            {afterRealised < realisedGains && (
              <div className="mt-2 text-green-200 font-semibold">
                You’re going to save ₹{savings.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Holdings</h2>

        <table className="w-full text-left border">
          <thead>
            <tr className="border-b">
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-2">Asset</th>
              <th className="p-2">Holdings</th>
              <th className="p-2">Current Price</th>
              <th className="p-2">STCG</th>
              <th className="p-2">LTCG</th>
              <th className="p-2">Amount to Sell</th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedCoins.includes(index)}
                    onChange={() => handleSelect(index)}
                  />
                </td>

                <td className="p-2 flex items-center gap-2">
                  <img src={item.logo} alt="" className="w-6 h-6" />
                  <div>
                    <p className="font-medium">{item.coin}</p>
                    <p className="text-xs text-gray-500">{item.coinName}</p>
                  </div>
                </td>

                <td className="p-2">
                  <p>{item.totalHolding}</p>
                  <p className="text-xs text-gray-500">
                    Avg: ₹{item.averageBuyPrice}
                  </p>
                </td>

                <td className="p-2">₹{item.currentPrice}</td>

                <td
                  className={`p-2 ${
                    item.stcg.gain >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{item.stcg.gain}
                </td>

                <td
                  className={`p-2 ${
                    item.ltcg.gain >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{item.ltcg.gain}
                </td>

                <td className="p-2">
                  {selectedCoins.includes(index) ? item.totalHolding : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
