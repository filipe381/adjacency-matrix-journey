
import { useState, useEffect } from 'react';

interface GraphMatrixProps {
  matrix: number[][];
  toggleEdge: (i: number, j: number) => void;
  highlightedCells?: {[key: string]: string};
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const GraphMatrix: React.FC<GraphMatrixProps> = ({ matrix, toggleEdge, highlightedCells = {} }) => {
  if (!matrix.length) return null;

  const n = matrix.length;

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-10 h-10 border-r border-b"></th>
            {Array(n).fill(0).map((_, j) => (
              <th key={j} className="w-10 h-10 border-b font-semibold">
                {letters[j]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th className="w-10 h-10 border-r bg-muted/50 font-semibold">
                {letters[i]}
              </th>
              {row.map((cell, j) => {
                const cellKey = `${i}-${j}`;
                const highlightClass = highlightedCells[cellKey] || '';
                
                return (
                  <td 
                    key={j} 
                    className={`w-10 h-10 text-center transition-all cursor-pointer hover:bg-blue-50 
                      ${cell === 1 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white dark:bg-slate-900'}
                      ${highlightClass}`}
                    onClick={() => toggleEdge(i, j)}
                    title={`Aresta de ${letters[i]} para ${letters[j]}`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GraphMatrix;
