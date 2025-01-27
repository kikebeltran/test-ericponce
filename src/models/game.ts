export interface Game {
    id: string
    name: string;
    emoji: string;
    description: string;
    status: 'ready' | 'running' | 'ranking';
    config: any;
    results: Record<string, number>;
}
