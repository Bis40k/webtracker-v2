import React from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Eye, 
  Database, 
  Server,
  Fingerprint,
  FileCode,
  Bug,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const owaspTop10 = [
  { id: 'A01', name: 'Broken Access Control', status: 'Secure', score: 100, icon: Lock },
  { id: 'A02', name: 'Cryptographic Failures', status: 'Secure', score: 100, icon: Fingerprint },
  { id: 'A03', name: 'Injection', status: 'At Risk', score: 75, icon: FileCode },
  { id: 'A04', name: 'Insecure Design', status: 'Secure', score: 95, icon: ShieldCheck },
  { id: 'A05', name: 'Security Misconfiguration', status: 'Secure', score: 90, icon: Server },
  { id: 'A06', name: 'Vulnerable Components', status: 'Secure', score: 100, icon: Bug },
  { id: 'A07', name: 'Identification/Auth Failures', status: 'Secure', score: 100, icon: Eye },
  { id: 'A08', name: 'Software/Data Integrity', status: 'Warning', score: 60, icon: Database },
  { id: 'A09', name: 'Logging/Monitoring Failures', status: 'Secure', score: 100, icon: Activity },
  { id: 'A10', name: 'Server-Side Request Forgery', status: 'Secure', score: 95, icon: ShieldAlert },
]

export default function SecurityPage() {
  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
            <p className="text-muted-foreground">OWASP Top 10 compliance and system vulnerability scan results.</p>
          </div>
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 text-sm">
            SYSTEM SECURE
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Global Threat Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">LOW</div>
              <p className="text-xs text-muted-foreground">No active threats detected in your network.</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">92/100</div>
              <Progress value={92} className="h-1" />
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Encrypted Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">All beacon communication is TLS 1.3 secured.</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">OWASP Top 10 Status (2024)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {owaspTop10.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-none shadow-md h-full flex flex-col group hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{item.id}</span>
                    <item.icon className={`w-4 h-4 ${
                      item.status === 'Secure' ? 'text-primary' : 
                      item.status === 'Warning' ? 'text-amber-500' : 'text-destructive'
                    }`} />
                  </div>
                  <CardTitle className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 mt-auto">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={
                      item.status === 'Secure' ? 'text-emerald-500 font-bold' : 
                      item.status === 'Warning' ? 'text-amber-500 font-bold' : 'text-destructive font-bold'
                    }>
                      {item.status}
                    </span>
                    <span className="text-muted-foreground">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className={`h-1 ${
                    item.status === 'Secure' ? '[&>div]:bg-emerald-500' : 
                    item.status === 'Warning' ? '[&>div]:bg-amber-500' : '[&>div]:bg-destructive'
                  }`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Latest Security Patch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Version</span>
                  <span className="text-muted-foreground">v2.4.12-secure</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Released</span>
                  <span className="text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Integrity Hash</span>
                  <span className="text-muted-foreground font-mono text-[10px]">sha256:7a8b9c...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden border-l-4 border-amber-500">
            <CardHeader className="bg-amber-500/5">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                We detected minor software/data integrity issues in 1/5 beacons. Please rotate your API keys to maintain maximum security.
              </p>
              <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                Action Required: Key Rotation
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
