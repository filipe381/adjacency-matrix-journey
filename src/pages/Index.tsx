
import { useState, useEffect } from 'react';
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
  };

  // Toggles edge in the adjacency matrix
  const toggleEdge = (i: number, j: number) => {
    const newMatrix = [...adjacencyMatrix];
    newMatrix[i][j] = newMatrix[i][j] === 1 ? 0 : 1;
    setAdjacencyMatrix(newMatrix);
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
    
    const result = dfs(adjacencyMatrix, start);
    setOutput(result);
  };

  function dfs(matrix: number[][], start: number) {
    const n = matrix.length;
    const visited = new Array(n).fill(false);
    const outputLines = [];
    
    function indent(level: number) {
      return '→'.repeat(level) + ' ';
    }

    function _dfs(u: number, depth: number) {
      visited[u] = true;
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
    
    const result = bfs(adjacencyMatrix, start);
    setOutput(result);
  };

  function bfs(matrix: number[][], start: number) {
    const n = matrix.length;
    const visited = new Array(n).fill(false);
    const dist = new Array(n).fill(Infinity);
    const queue = [];

    visited[start] = true;
    dist[start] = 0;
    queue.push(start);

    const order = [];

    while(queue.length > 0) {
      const u = queue.shift()!;
      order.push(letters[u]);

      for(let v=0; v<n; v++) {
        if(matrix[u][v] === 1 && !visited[v]) {
          visited[v] = true;
          dist[v] = dist[u] + 1;
          queue.push(v);
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
