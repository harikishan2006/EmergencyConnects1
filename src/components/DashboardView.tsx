import { 
  Activity, Ambulance, Bed, Clock, Heart, LayoutDashboard, ListChecks, 
  LogOut, MapPin, Navigation, Phone, Route, Search, Shield, ShieldCheck, 
  Stethoscope, User, Users, Wifi, AlertCircle, BarChart3, Settings, 
  History, Map as MapIcon, Bell, ChevronRight, TrendingDown, TrendingUp,
  Building2, CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BrandLogo from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AvailabilityView from "./AvailabilityView";
import HospitalSearchView from "./HospitalSearchView";
import ServicesView from "./ServicesView";
import UserDirectoryView from "./UserDirectoryView";

interface DashboardViewProps {
  onNavigate: (view: "landing") => void;
}

const DashboardView = ({ onNavigate }: DashboardViewProps) => {
  const [tab, setTab] = useState<"dashboard" | "search" | "availability" | "users" | "analytics" | "logs" | "queue" | "map" | "services">("dashboard");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      // Ensure we stay on dashboard even if role check is slow
    };
    getSession();
    return () => clearInterval(timer);
  }, []);

  const isHospital = currentUser?.user_metadata?.user_type === "hospital";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' IST';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const NavItem = ({ icon: Icon, label, id, active, count, onClick }: { icon: any, label: string, id: string, active?: boolean, count?: string, onClick?: () => void }) => (
    <button 
      onClick={onClick || (() => setTab(id as any))}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group ${
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 transition-colors ${active ? "text-primary" : "group-hover:text-primary"}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count && (
        <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-[10px] font-bold text-primary border border-primary/20">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020817] text-foreground flex overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/5 bg-[#030a1c] flex flex-col shrink-0">
        <div className="p-6">
          <BrandLogo iconClassName="h-6 w-6" className="mb-8" />
          
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest px-4 mb-2">Main</p>
            <NavItem icon={LayoutDashboard} label={isHospital ? "Dashboard" : "My Health Hub"} id="dashboard" active={tab === "dashboard"} />
            <NavItem icon={Route} label={isHospital ? "Live Routing" : "Find Hospitals"} id="search" active={tab === "search"} count={isHospital ? "3" : undefined} />
            {isHospital && <NavItem icon={Bed} label="Bed Management" id="availability" active={tab === "availability"} />}
            {isHospital && <NavItem icon={Users} label="Doctor Roster" id="users" active={tab === "users"} />}
          </div>

          <div className="space-y-1 mt-8">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest px-4 mb-2">Operations</p>
            <NavItem icon={BarChart3} label="Analytics" id="analytics" />
            <NavItem icon={History} label={isHospital ? "Audit Logs" : "My History"} id="logs" />
            {!isHospital && <NavItem icon={ListChecks} label="My Records" id="queue" />}
            {isHospital && <NavItem icon={ListChecks} label="Patient Queue" id="queue" count="7" />}
            <NavItem icon={MapIcon} label="Network Map" id="map" />
          </div>

          <div className="mt-auto p-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  {isHospital ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground truncate max-w-[120px]">
                    {isHospital ? "Apollo Hospitals" : (currentUser?.user_metadata?.name || "Patient User")}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {isHospital ? "Greams Road, Chennai" : "Verified Account"}
                  </p>
                </div>
              </div>
              <button 
                onClick={async () => { 
                  try { await supabase.auth.signOut(); } catch(e) { console.error(e); }
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full py-2 rounded-lg bg-white/5 text-[11px] font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#030a1c]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                {isHospital ? "Apollo Hospitals — Emergency Dashboard" : "EmergencyConnect — Patient Command Center"}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                Greams Road, Thousand Lights, Chennai – 600 006 · {formatDate(currentTime)} · {formatTime(currentTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] gap-1.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-active-pulse" /> Level 1 Emergency Sync
              </Badge>
              <Badge className="bg-white/5 text-muted-foreground border-white/10 text-[10px] gap-1.5 py-1">
                <MapPin className="h-3 w-3" /> Chennai, TN
              </Badge>
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <button onClick={() => toast.info("You have 3 unread emergency alerts.")} className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center relative hover:bg-white/10 transition-all">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-0 right-0 h-3 w-3 bg-destructive text-[8px] font-bold rounded-full flex items-center justify-center text-white border-2 border-[#030a1c]">3</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-black">VK</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0a1124] border-white/10 text-foreground">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => setTab("profile")} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-primary transition-colors">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTab("settings")} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-primary transition-colors">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={async () => { 
                      try { await supabase.auth.signOut(); } catch(e) { console.error(e); }
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {tab === "dashboard" && !isHospital && (
            <div className="space-y-8 animate-fade-in p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-widest">My Health Hub</h3>
                  <p className="text-xs text-muted-foreground uppercase mt-1">Patient Command Center</p>
                </div>
                <button onClick={() => setTab("search")} className="btn-primary bg-primary py-2 px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Find Nearest ER
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-[#0a1124] border-white/5 md:col-span-2">
                  <h4 className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4">Active Medical Profile</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Blood Group</p>
                      <p className="text-xl font-black text-destructive flex items-center gap-2"><Heart className="h-4 w-4" /> O Positive</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Known Allergies</p>
                      <p className="text-sm font-bold text-foreground">Penicillin, Peanuts</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 col-span-2 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Emergency Contact</p>
                        <p className="text-sm font-bold text-foreground">Suresh Kumar (Father)</p>
                      </div>
                      <button className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 bg-[#0a1124] border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-bl-full flex items-start justify-end p-3"><Activity className="h-5 w-5 text-accent" /></div>
                  <h4 className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4">Current Vitals</h4>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-muted-foreground">Heart Rate</span>
                        <span className="text-accent">72 BPM</span>
                      </div>
                      <Progress value={45} className="h-1 bg-white/10 [&>div]:bg-accent" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-muted-foreground">Blood Pressure</span>
                        <span className="text-primary">120/80</span>
                      </div>
                      <Progress value={60} className="h-1 bg-white/10 [&>div]:bg-primary" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-muted-foreground">O2 Saturation</span>
                        <span className="text-emerald-400">98%</span>
                      </div>
                      <Progress value={98} className="h-1 bg-white/10 [&>div]:bg-emerald-400" />
                    </div>
                  </div>
                  <p className="text-[8px] text-muted-foreground uppercase text-center mt-6">Last synced: 2 hours ago from Apple Watch</p>
                </div>
              </div>

              <div className="glass-card p-6 bg-[#0a1124] border-white/5">
                <h4 className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4">Recent Emergency Consultations</h4>
                <div className="space-y-3">
                  {[
                    { date: "May 10", title: "Virtual Triage", doctor: "Dr. Anand", status: "Resolved", type: "Tele-Consult" },
                    { date: "Apr 22", title: "Minor Fracture Assessment", doctor: "SIMS Ortho Dept", status: "Follow-up Req.", type: "In-Person" }
                  ].map((appt, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary">{appt.date.split(' ')[1]}</div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{appt.title}</p>
                          <p className="text-[10px] text-muted-foreground">{appt.doctor} • {appt.type}</p>
                        </div>
                      </div>
                      <Badge className={`border-none text-[9px] uppercase tracking-widest ${appt.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent/10 text-accent'}`}>{appt.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "search" && (
            <div className="animate-fade-in">
              <HospitalSearchView />
            </div>
          )}

          {tab === "analytics" && (
            <div className="space-y-6 animate-fade-in p-4 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Analytics Engine</h3>
                  <p className="text-[10px] text-muted-foreground uppercase">Real-time network capacity metrics</p>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                {[
                  { label: "Total Admissions", val: "1,204", color: "text-blue-400" },
                  { label: "Avg Route Time", val: "8.4 min", color: "text-emerald-400" },
                  { label: "Critical Cases", val: "142", color: "text-destructive" },
                  { label: "Network Uptime", val: "99.9%", color: "text-primary" }
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 bg-[#0a1124] border-white/5">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
              <div className="glass-card p-6 bg-[#0a1124] border-white/5 flex-1 flex flex-col">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6">7-Day Routing Volume Trend</p>
                <div className="flex-1 flex items-end gap-2">
                  {[40, 60, 45, 80, 55, 90, 65, 50, 75, 85, 60, 95, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-md relative group" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{h * 12}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "logs" && (
            <div className="space-y-6 animate-fade-in p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"><History className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Audit Logs & History</h3>
                  <p className="text-[10px] text-muted-foreground uppercase">Cryptographically verified activity ledger</p>
                </div>
              </div>
              <div className="glass-card bg-[#0a1124] border-white/5 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Timestamp</TableHead>
                      <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Event Type</TableHead>
                      <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Details</TableHead>
                      <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { time: "Today, 14:32", type: "System Login", details: "Authenticated via secure token from 192.168.1.1", status: "Success", color: "text-emerald-500" },
                      { time: "Today, 11:15", type: "Network Query", details: "Searched for Pulmonology specialists in Chennai", status: "Processed", color: "text-primary" },
                      { time: "Yesterday, 09:45", type: "Routing Update", details: "Live capacity refreshed for Kauvery Hospital", status: "Processed", color: "text-primary" },
                      { time: "12 May, 18:20", type: "Admission Request", details: "Requested ER-02 at Apollo Main Hospital", status: "Completed", color: "text-accent" },
                      { time: "10 May, 08:00", type: "Profile Update", details: "Updated emergency contact information", status: "Success", color: "text-emerald-500" },
                    ].map((log, i) => (
                      <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="py-4 text-xs text-muted-foreground">{log.time}</TableCell>
                        <TableCell className="py-4 text-xs font-bold text-foreground">{log.type}</TableCell>
                        <TableCell className="py-4 text-xs text-muted-foreground">{log.details}</TableCell>
                        <TableCell className="py-4 text-right"><span className={`text-[10px] font-black uppercase tracking-widest ${log.color}`}>{log.status}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {tab === "queue" && (
            <div className="space-y-6 animate-fade-in p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"><ListChecks className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Clinical Records</h3>
                  <p className="text-[10px] text-muted-foreground uppercase">Past admissions and active treatments</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { date: "May 12, 2026", facility: "Apollo Main Hospital", condition: "Acute Asthma Exacerbation", doctor: "Dr. Rajesh Kumar", status: "Discharged" },
                  { date: "Jan 04, 2026", facility: "SIMS Vadapalani", condition: "Minor Trauma Stabilization", doctor: "Dr. Meera Raghavan", status: "Discharged" },
                ].map((record, i) => (
                  <div key={i} className="glass-card p-6 bg-[#0a1124] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">{record.date}</p>
                        <h4 className="text-lg font-bold text-foreground">{record.condition}</h4>
                      </div>
                      <Badge className="bg-white/5 text-muted-foreground border-none text-[9px] uppercase tracking-widest">{record.status}</Badge>
                    </div>
                    <div className="space-y-2 mt-6">
                      <p className="text-xs text-muted-foreground flex items-center gap-2"><Building2 className="h-3 w-3" /> {record.facility}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2"><Stethoscope className="h-3 w-3" /> {record.doctor}</p>
                    </div>
                    <button className="w-full mt-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest text-foreground">View Full Report</button>
                  </div>
                ))}
                
                <div className="glass-card p-6 bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4"><ListChecks className="h-6 w-6 text-muted-foreground" /></div>
                  <p className="text-sm font-bold text-foreground">Sync Legacy Records</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">Connect your external ABHA ID to import previous medical history.</p>
                </div>
              </div>
            </div>
          )}

          {tab === "map" && (
            <div className="h-full w-full rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden flex flex-col animate-fade-in p-1">
              <div className="absolute top-4 left-4 z-10 bg-[#020817]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl max-w-xs">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2"><MapIcon className="h-4 w-4 text-primary" /> Live Network Map</h3>
                <p className="text-[10px] text-muted-foreground uppercase mt-1">Real-time OSM Layer — 35km Radius Active</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-active-pulse" />
                  <span className="text-xs font-bold text-foreground">Systems Operational</span>
                </div>
              </div>
              <iframe 
                src="https://www.openstreetmap.org/export/embed.html?bbox=79.95,12.95,80.35,13.15&layer=mapnik" 
                className="w-full h-full rounded-[20px] filter invert hue-rotate-180 brightness-75 contrast-125" 
                style={{ border: 0 }}
                title="Live Regional Map"
              />
            </div>
          )}

          {tab === "profile" && (
            <div className="space-y-8 animate-fade-in p-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-6 glass-card p-8 bg-[#0a1124] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-transparent" />
                <Avatar className="h-24 w-24 border-4 border-[#0a1124] relative z-10 shadow-xl">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black">VK</AvatarFallback>
                </Avatar>
                <div className="relative z-10 flex-1">
                  <h3 className="text-3xl font-black text-foreground">Harikishan</h3>
                  <p className="text-sm text-primary font-bold uppercase tracking-widest mb-4">Patient Account</p>
                  <div className="flex gap-4">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] font-black"><CheckCircle2 className="h-3 w-3 mr-1" /> Identity Verified</Badge>
                    <Badge className="bg-white/5 text-muted-foreground border-white/10 uppercase text-[9px] font-black"><Phone className="h-3 w-3 mr-1" /> +91 9876543210</Badge>
                  </div>
                </div>
                <button className="relative z-10 btn-primary bg-primary py-2 px-6 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Edit Profile</button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-white/5 bg-white/5 space-y-4">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 pb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div><p className="text-muted-foreground text-[10px] uppercase">Full Name</p><p className="font-bold text-foreground">Harikishan</p></div>
                    <div><p className="text-muted-foreground text-[10px] uppercase">Date of Birth</p><p className="font-bold text-foreground">14 Aug 1995</p></div>
                    <div><p className="text-muted-foreground text-[10px] uppercase">Gender</p><p className="font-bold text-foreground">Male</p></div>
                    <div><p className="text-muted-foreground text-[10px] uppercase">ABHA ID</p><p className="font-bold text-primary">12-3456-7890</p></div>
                  </div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-white/5 space-y-4">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 pb-2">Medical Overview</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div><p className="text-muted-foreground text-[10px] uppercase">Blood Type</p><p className="font-black text-destructive">O+</p></div>
                    <div><p className="text-muted-foreground text-[10px] uppercase">Height / Weight</p><p className="font-bold text-foreground">178 cm / 72 kg</p></div>
                    <div className="col-span-2"><p className="text-muted-foreground text-[10px] uppercase">Primary Physician</p><p className="font-bold text-foreground flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> Dr. Meera Raghavan</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-6 animate-fade-in p-4 max-w-4xl mx-auto">
              <h3 className="text-2xl font-black text-foreground uppercase tracking-widest mb-6">Preferences & Settings</h3>
              
              <div className="space-y-4">
                <div className="glass-card p-6 border-white/5 bg-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Push Notifications</h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Receive critical emergency alerts instantly.</p>
                  </div>
                  <div className="h-6 w-10 bg-primary rounded-full relative cursor-pointer"><div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1" /></div>
                </div>

                <div className="glass-card p-6 border-white/5 bg-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location Tracking</h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Allow background location for faster ambulance routing.</p>
                  </div>
                  <div className="h-6 w-10 bg-primary rounded-full relative cursor-pointer"><div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1" /></div>
                </div>

                <div className="glass-card p-6 border-white/5 bg-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Biometric Authentication</h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Use FaceID/Fingerprint to unlock clinical records.</p>
                  </div>
                  <div className="h-6 w-10 bg-white/10 rounded-full relative cursor-pointer"><div className="h-4 w-4 bg-muted-foreground rounded-full absolute left-1 top-1" /></div>
                </div>
                
                <div className="glass-card p-6 border-white/5 bg-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Delete Account</h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Permanently remove your profile and medical history.</p>
                  </div>
                  <button className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-destructive hover:text-white transition-colors">Delete</button>
                </div>
              </div>
            </div>
          )}

          {tab === "dashboard" && isHospital && (
            <div className="space-y-8 animate-fade-in">
              {/* LIVE ALERT TUBE */}
              <div className="h-10 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 relative overflow-hidden">
                <div className="flex items-center gap-2 shrink-0 border-r border-white/10 pr-4 mr-4">
                  <Badge className="bg-destructive text-white border-none text-[9px] font-black tracking-tighter px-2">LIVE</Badge>
                </div>
                <div className="flex items-center gap-8 overflow-hidden">
                  <p className="text-xs text-muted-foreground animate-marquee whitespace-nowrap flex items-center gap-2">
                    <Ambulance className="h-3 w-3 text-primary" /> Ambulance EC-04 ETA 4 min — Apollo ER Bay 2 cleared | <AlertCircle className="h-3 w-3 text-accent" /> MGM Healthcare: ICU capacity at 85% — rerouting advisory active | <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Kauvery Alwarpet: 8 beds cleared
                  </p>
                </div>
              </div>

              {/* TOP STATS CARDS */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "EMERGENCY BEDS AVAILABLE", value: "12", total: "/ 50", sub: "Main ER + Trauma Wing", trend: "Down 4 from 6h ago", trendUp: false, color: "text-primary", icon: Bed },
                  { title: "ACTIVE DOCTORS ON DUTY", value: "8", total: "/ 12", sub: "Across 4 departments", trend: "+2 since morning shift", trendUp: true, color: "text-emerald-400", icon: Stethoscope },
                  { title: "AMBULANCES ROUTED TODAY", value: "23", total: "", sub: "Avg. response: 7.4 min", trend: "+6 vs. yesterday", trendUp: true, color: "text-destructive", icon: Ambulance },
                ].map((s, idx) => (
                  <div key={idx} className="glass-card p-6 border-white/5 bg-[#0a1124] relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{s.title}</p>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black ${s.color}`}>{s.value}</span>
                          <span className="text-xl text-muted-foreground font-light">{s.total}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge className={`text-[9px] py-0.5 ${s.trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"} border-none`}>
                        {s.trendUp ? <TrendingUp className="h-2.5 w-2.5 mr-1" /> : <TrendingDown className="h-2.5 w-2.5 mr-1" />}
                        {s.trend}
                      </Badge>
                    </div>
                    {/* MINI CHART MOCKUP */}
                    <div className="mt-6 flex items-end gap-1 h-12">
                      {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={idx+i} className={`flex-1 rounded-t-sm transition-all duration-500 ${s.color.replace('text-', 'bg-')}/30`} style={{ height: `${Math.random() * 100}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* SECOND ROW: LIVE FACILITY INFO & ROUTING FEED */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* LIVE FACILITY INFO */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="glass-card p-8 border-white/5 bg-[#0a1124]">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">🏥 Live Facility Info</span>
                        <Badge className="bg-destructive/20 text-destructive border-none text-[8px] font-black px-1.5 py-0.5">LIVE</Badge>
                      </div>
                      <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-white/10 px-3 py-1 rounded-lg">Edit Profile</button>
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                      <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Apollo Hospitals, Greams Road</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">21, Greams Lane, Thousand Lights, Chennai – 600 006, Tamil Nadu</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black tracking-widest px-2">NABH ACCREDITED</Badge>
                          <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black tracking-widest px-2">MCI VERIFIED</Badge>
                          <Badge className="bg-accent/20 text-accent border-none text-[8px] font-black tracking-widest px-2">JCI LEVEL 3</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: "Dr. Vijay Kishore", role: "Senior Interventional Cardiologist", active: true, fallback: "VK" },
                        { name: "Dr. Meera Raghavan", role: "Trauma Care & Emergency Medicine", active: true, fallback: "MR" },
                      ].map((doc, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border border-white/10">
                              <AvatarFallback className="bg-[#1e293b] text-primary text-xs font-bold">{doc.fallback}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-foreground">{doc.name}</p>
                              <p className="text-[10px] text-muted-foreground">{doc.role}</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-active-pulse" /> Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* EMERGENCY ROUTING FEED */}
                <div className="lg:col-span-7">
                  <div className="glass-card p-8 border-white/5 bg-[#0a1124] h-full">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">🗺️ Emergency Routing Feed</span>
                        <Badge className="bg-destructive/20 text-destructive border-none text-[8px] font-black px-1.5 py-0.5">LIVE</Badge>
                      </div>
                      <button onClick={() => setTab("map")} className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-white/10 px-3 py-1 rounded-lg flex items-center gap-2">
                        Expand Map <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest h-10">Hospital</TableHead>
                            <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest h-10">Doctor on Duty</TableHead>
                            <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest h-10 text-center">Beds Avail.</TableHead>
                            <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest h-10 text-center">ETA</TableHead>
                            <TableHead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest h-10 text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { name: "MGM Healthcare", loc: "Nelson Manickam Road", doc: "Dr. S. Ananth", spec: "Critical Care & ECMO", beds: "7/25", eta: "8 min", color: "bg-destructive" },
                            { name: "SIMS Hospital", loc: "Vadapalani", doc: "Dr. Raju Sivasamy", spec: "Senior Orthopaedic Surgeon", beds: "18/29", eta: "12 min", color: "bg-primary" },
                            { name: "MIOT International", loc: "Manapakkam", doc: "Dr. Prithvi Mohandas", spec: "Hip & Joint Replacement", beds: "22/38", eta: "17 min", color: "bg-accent" },
                            { name: "Kauvery Hospital", loc: "Alwarpet", doc: "Dr. Aravindan Selvaraj", spec: "Multi-Organ Transplant", beds: "8/15", eta: "9 min", color: "bg-emerald-500" },
                            { name: "Fortis Malar", loc: "Adyar", doc: "Dr. Nandakumar Sundaram", spec: "Traumatology & Spine", beds: "10/25", eta: "14 min", color: "bg-orange-500" },
                          ].map((h, i) => (
                            <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-muted-foreground`}>
                                    {h.name.split(' ')[0][0]}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-foreground">{h.name}</p>
                                    <p className="text-[9px] text-muted-foreground">{h.loc}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-xs font-bold text-foreground">{h.doc}</p>
                                <p className="text-[9px] text-muted-foreground">{h.spec}</p>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className="text-xs font-bold text-foreground">{h.beds}</span>
                                  <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${h.color}`} style={{ width: `${(parseInt(h.beds.split('/')[0])/parseInt(h.beds.split('/')[1]))*100}%` }} />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <span className="text-xs font-black text-accent">{h.eta}</span>
                              </TableCell>
                              <TableCell className="py-4 text-right">
                                <button onClick={() => toast.success(`Routing protocol initiated for ${h.name}`)} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">Route →</button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "availability" && <AvailabilityView currentUser={currentUser} />}
          {tab === "services" && <ServicesView />}
          {tab === "users" && <UserDirectoryView />}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
