import { AppShell } from './components/AppShell';
import { ContractPanel } from './components/ContractPanel';
import { ExecutionPanel } from './components/ExecutionPanel';
import { SessionPanel } from './components/SessionPanel';
import { TopBar } from './components/TopBar';

const App = () => {
  return (
    <AppShell>
      <TopBar />
      <main className="grid min-h-0 flex-1 gap-4 lg:gap-5 xl:grid-cols-[320px_minmax(420px,1fr)_minmax(420px,1fr)]">
        <SessionPanel />
        <ContractPanel />
        <ExecutionPanel />
      </main>
    </AppShell>
  );
};

export default App;
