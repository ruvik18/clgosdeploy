import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import Colleges from "@/pages/Colleges";
import CollegeDetail from "@/pages/CollegeDetail";
import Counsellings from "@/pages/Counsellings";
import CounsellingDetail from "@/pages/CounsellingDetail";
import CounsellingPredict from "@/pages/CounsellingPredict";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Shortlist from "@/pages/Shortlist";
import Compare from "@/pages/Compare";
import Fit from "@/pages/Fit";
import Branches from "@/pages/Branches";
import JosaaList from "@/pages/JosaaList";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/counsellings" component={Counsellings} />
        <Route path="/counsellings/:slug" component={CounsellingDetail} />
        <Route path="/counsellings/:slug/predict" component={CounsellingPredict} />
        <Route path="/colleges" component={Colleges} />
        <Route path="/colleges/:slug" component={CollegeDetail} />
        <Route path="/shortlist" component={Shortlist} />
        <Route path="/compare" component={Compare} />
        <Route path="/fit" component={Fit} />
        <Route path="/branches" component={Branches} />
        <Route path="/josaa-list" component={JosaaList} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
