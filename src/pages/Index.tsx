
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GraphMatrix from '@/components/GraphMatrix';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const maxVertices = 26;
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const Index = () => {
  const [N, setN] = useState(4);
  const [adjacencyMatrix, setAdjacencyMatrix] = useState<number[][]>([]);
  const [startVertex, setStartVertex] = useState("");
  const [output, setOutput] = useState("");
  const [graphTraversal, setGraphTraversal] = useState<{
    nodes: string[];
    edges: [number, number][];
    traversalOrder: string;
    visitOrder: number[];
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateMatrix(N);
  }, []);

  // Gera a matriz NxN de zeros
  const createEmptyMatrix = (n: number) => {
    const matrix: number[][] = [];
    for(let i=0; i<n; i++) {
      const row: number[] = [];
      for(let j=0; j<n; j++) {
        row.push(0);
      }
      matrix.push(row);
    }
    return matrix;
  };

  const generateMatrix = (vertices: number) => {
    if(isNaN(vertices) || vertices < 1 || vertices > maxVertices) {
      toast({
        title: "Valor inválido",
        description: `Informe um número válido entre 1 e ${maxVertices}.`,
        variant: "destructive"
      });
      return;
    }
    setN(vertices);
    setAdjacencyMatrix(createEmptyMatrix(vertices));
    setOutput("");
    setGraphTraversal(null);
  };

  // Toggles edge in the adjacency matrix
  const toggleEdge = (i: number, j: number) => {
    const newMatrix = [...adjacencyMatrix];
    newMatrix[i][j] = newMatrix[i][j] === 1 ? 0 : 1;
    setAdjacencyMatrix(newMatrix);
    setGraphTraversal(null); // Reset visualization when graph changes
  };

  // Parse vertex input to numeric index
  const parseStartVertex = (value: string) => {
    value = value.trim().toUpperCase();
    if(value === "") return null;

    // If it's a number
    if(/^\d+$/.test(value)) {
      const idx = parseInt(value, 10);
      if(idx >=0 && idx < N) return idx;
      else return null;
    }

    // If it's a letter
    if(value.length === 1 && letters.includes(value)) {
      return letters.indexOf(value);
    }
    return null;
  };

  // Generate the graph structure from adjacency matrix
  const buildGraphStructure = (matrix: number[][], traversalSequence: number[], algorithm: string) => {
    const n = matrix.length;
    const nodes = Array(n).fill(0).map((_, i) => letters[i]);
    const edges: [number, number][] = [];
    
    // Extract all edges from the adjacency matrix
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] === 1) {
          edges.push([i, j]);
        }
      }
    }
    
    return {
      nodes,
      edges,
      traversalOrder: algorithm,
      visitOrder: traversalSequence
    };
  };

  // DFS with step-by-step output and backtracking
  const runDFS = () => {
    if(N === 0) {
      toast({
        title: "Erro",
        description: "Gere a matriz primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    const start = parseStartVertex(startVertex);
    if(start === null) {
      toast({
        title: "Vértice inválido",
        description: `Informe um vértice inicial válido (letra A-Z ou índice 0-${N-1}).`,
        variant: "destructive"
      });
      return;
    }
    
    const visitSequence: number[] = [];
    const result = dfs(adjacencyMatrix, start, visitSequence);
    setOutput(result);
    
    setGraphTraversal(buildGraphStructure(adjacencyMatrix, visitSequence, 'DFS'));
  };

  function dfs(matrix: number[][], start: number, visitSequence: number[]) {
    const n = matrix.length;
    const visited = new Array(n).fill(false);
    const outputLines = [];
    
    function indent(level: number) {
      return '→'.repeat(level) + ' ';
    }

    function _dfs(u: number, depth: number) {
      visited[u] = true;
      visitSequence.push(u);
      outputLines.push(indent(depth) + letters[u]);

      for(let v=0; v<n; v++) {
        if(matrix[u][v] === 1 && !visited[v]) {
          _dfs(v, depth + 1);
          outputLines.push('←'.repeat(depth + 1) + ' backtrack de ' + letters[v] + ' para ' + letters[u]);
        }
      }
    }

    outputLines.push("DFS Traversal (com backtracking):\n");
    _dfs(start, 0);
    outputLines.push("(end)");
    return outputLines.join('\n');
  }

  // BFS with distances
  const runBFS = () => {
    if(N === 0) {
      toast({
        title: "Erro",
        description: "Gere a matriz primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    const start = parseStartVertex(startVertex);
    if(start === null) {
      toast({
        title: "Vértice inválido", 
        description: `Informe um vértice inicial válido (letra A-Z ou índice 0-${N-1}).`,
        variant: "destructive"
      });
      return;
    }
    
    const visitSequence: number[] = [];
    const result = bfs(adjacencyMatrix, start, visitSequence);
    setOutput(result);
    
    setGraphTraversal(buildGraphStructure(adjacencyMatrix, visitSequence, 'BFS'));
  };

  function bfs(matrix: number[][], start: number, visitSequence: number[]) {
    const n = matrix.length;
    const visited = new Array(n).fill(false);
    const dist = new Array(n).fill(Infinity);
    const queue = [];

    visited[start] = true;
    dist[start] = 0;
    queue.push(start);
    visitSequence.push(start);

    const order = [letters[start]];

    while(queue.length > 0) {
      const u = queue.shift()!;

      for(let v=0; v<n; v++) {
        if(matrix[u][v] === 1 && !visited[v]) {
          visited[v] = true;
          dist[v] = dist[u] + 1;
          queue.push(v);
          visitSequence.push(v);
          order.push(letters[v]);
        }
      }
    }

    // Format text output
    let out = "BFS: " + order.join(" → ") + "\n";
    out += "Distâncias:\n";
    for(let i=0; i<n; i++) {
      if(dist[i] === Infinity) {
        out += letters[i] + ": ∞ (inacessível)\n";
      } else {
        out += letters[i] + ": " + dist[i] + "\n";
      }
    }
    return out;
  }
  
  const renderGraphVisualization = () => {
    if (!graphTraversal) return null;
    
    const { nodes, edges, traversalOrder, visitOrder } = graphTraversal;
    
    // Generate positions for the nodes in a circle layout
    const nodePositions: {[key: string]: {x: number, y: number}} = {};
    const radius = 120;
    const centerX = 150;
    const centerY = 150;
    
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      nodePositions[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    // Create a traversal path string like "A B C D E F"
    const traversalPath = visitOrder.map(idx => letters[idx]).join(" → ");
    
    return (
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">
          {traversalOrder} Visualization: {traversalPath}
        </h3>
        <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 relative" style={{height: '300px'}}>
          <svg width="100%" height="100%" viewBox="0 0 300 300" className="mx-auto">
            {/* Draw edges first so they're beneath the nodes */}
            {edges.map(([from, to], i) => {
              const fromNode = letters[from];
              const toNode = letters[to];
              const fromPos = nodePositions[fromNode];
              const toPos = nodePositions[toNode];
              
              // Calculate if this edge is part of the traversal path
              let isTraversalEdge = false;
              for (let i = 0; i < visitOrder.length - 1; i++) {
                if (visitOrder[i] === from && visitOrder[i + 1] === to) {
                  isTraversalEdge = true;
                  break;
                }
              }
              
              // Draw an arrow
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const angle = Math.atan2(dy, dx);
              const nodeRadius = 20;
              
              // Adjust end points to account for node radius
              const startX = fromPos.x + nodeRadius * Math.cos(angle);
              const startY = fromPos.y + nodeRadius * Math.sin(angle);
              const endX = toPos.x - nodeRadius * Math.cos(angle);
              const endY = toPos.y - nodeRadius * Math.sin(angle);
              
              // Calculate arrowhead points
              const arrowLength = 10;
              const arrowWidth = 6;
              const arrowAngle1 = angle + Math.PI - Math.PI / 6;
              const arrowAngle2 = angle + Math.PI + Math.PI / 6;
              const arrowX1 = endX + arrowLength * Math.cos(arrowAngle1);
              const arrowY1 = endY + arrowLength * Math.sin(arrowAngle1);
              const arrowX2 = endX + arrowLength * Math.cos(arrowAngle2);
              const arrowY2 = endY + arrowLength * Math.sin(arrowAngle2);
              
              return (
                <g key={`${from}-${to}`}>
                  <line 
                    x1={startX} 
                    y1={startY} 
                    x2={endX} 
                    y2={endY} 
                    stroke={isTraversalEdge ? '#4c6ef5' : '#ccc'} 
                    strokeWidth={isTraversalEdge ? 2 : 1}
                    strokeDasharray={isTraversalEdge ? "none" : "4,2"}
                  />
                  <polygon 
                    points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                    fill={isTraversalEdge ? '#4c6ef5' : '#ccc'}
                  />
                </g>
              );
            })}
            
            {/* Draw nodes */}
            {nodes.map((node, i) => {
              const pos = nodePositions[node];
              const visitIndex = visitOrder.indexOf(i);
              const isVisited = visitIndex !== -1;
              
              return (
                <g key={node}>
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="20" 
                    fill={isVisited ? '#3b82f6' : '#e2e8f0'} 
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <text 
                    x={pos.x} 
                    y={pos.y} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill={isVisited ? 'white' : 'black'} 
                    fontWeight="bold"
                    fontSize="14"
                  >
                    {node}
                  </text>
                  {isVisited && (
                    <text 
                      x={pos.x} 
                      y={pos.y - 30} 
                      textAnchor="middle" 
                      fill="#1e40af" 
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {visitIndex + 1}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Grafo: Matriz de Adjacência e Buscas
        </h1>
        <p className="text-muted-foreground mt-2">
          Ferramenta interativa para visualização e análise de grafos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" htmlFor="vertex-count">
                  Quantidade de vértices (1-26):
                </label>
                <div className="flex">
                  <Input 
                    type="number" 
                    id="vertex-count" 
                    min="1" 
                    max="26" 
                    value={N} 
                    onChange={(e) => setN(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button 
                    className="ml-2" 
                    onClick={() => generateMatrix(N)}
                  >
                    Gerar Matriz
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <GraphMatrix matrix={adjacencyMatrix} toggleEdge={toggleEdge} />
            </div>
            
            {graphTraversal && renderGraphVisualization()}
          </div>
        </Card>

        <Card className="p-5 flex flex-col">
          <h2 className="font-semibold text-lg mb-4">Executar Algoritmos</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="start-vertex">
              Vértice inicial:
            </label>
            <Input
              type="text"
              id="start-vertex"
              value={startVertex}
              onChange={(e) => setStartVertex(e.target.value)}
              className="w-full text-center uppercase"
              placeholder="A-Z ou 0-25"
              maxLength={2}
            />
          </div>
          
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={runDFS} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ChevronRight className="mr-1 h-4 w-4" />
              DFS
            </Button>
            <Button 
              onClick={runBFS}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <ChevronRight className="mr-1 h-4 w-4" />
              BFS
            </Button>
          </div>
          
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-1">Resultados:</label>
            <pre className="bg-slate-50 dark:bg-slate-900 border rounded-md p-3 text-sm overflow-auto h-[300px] whitespace-pre-wrap">
              {output || "Execute um algoritmo para ver os resultados..."}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
