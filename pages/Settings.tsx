import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Lock, Copy, Eye, EyeOff, Database, Loader2 } from 'lucide-react';
import { db } from '../utils/db';

export const Settings: React.FC = () => {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await db.seed();
      alert('Mock data seeded successfully! Go to Campaigns or Leads to view data.');
    } catch (e) {
      console.error(e);
      alert('Failed to seed data.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
       <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage API keys and security configurations.</p>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>Actions for maintaining your Supabase instance.</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
               <div>
                  <h4 className="font-medium">Seed Mock Data</h4>
                  <p className="text-sm text-muted-foreground">Populate database with demo campaigns and leads.</p>
               </div>
               <Button onClick={handleSeed} disabled={seeding} variant="outline" className="gap-2">
                  {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  {seeding ? 'Seeding...' : 'Seed Database'}
               </Button>
            </div>
         </CardContent>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle>Apify Configuration</CardTitle>
            <CardDescription>Required for data extraction.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-medium">API Token</label>
               <div className="relative">
                  <input type="password" value="apify_api_xxxxxxxxxxxxxxxxxxxxxx" readOnly className="w-full bg-secondary border border-border rounded-md pl-10 pr-10 py-2 text-sm text-muted-foreground font-mono" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                     <Eye size={16} />
                  </button>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium">LinkedIn Cookie (li_at)</label>
               <div className="relative">
                  <input type="password" value="AQEDAQ..." readOnly className="w-full bg-secondary border border-border rounded-md pl-10 pr-10 py-2 text-sm text-muted-foreground font-mono" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                     <EyeOff size={16} />
                  </button>
               </div>
               <p className="text-xs text-amber-500 flex items-center gap-1">Auth failure rate: 0% (Healthy)</p>
            </div>
         </CardContent>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle>Lemlist Configuration</CardTitle>
            <CardDescription>Required for campaign outreach.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-medium">API Key</label>
               <div className="relative">
                  <input type="password" value="lemlist_key_xxxxxxxx" readOnly className="w-full bg-secondary border border-border rounded-md pl-10 pr-10 py-2 text-sm text-muted-foreground font-mono" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
               </div>
            </div>
            
            <div className="p-4 bg-secondary/30 border border-border rounded-lg space-y-2">
               <label className="text-sm font-medium">Webhook Endpoint</label>
               <div className="flex gap-2">
                  <code className="flex-1 bg-black/30 p-2 rounded text-xs font-mono text-muted-foreground truncate">
                     https://api.nexus-sep.com/webhooks/lemlist
                  </code>
                  <Button variant="outline" size="sm" className="gap-2">
                     <Copy size={14} /> Copy
                  </Button>
               </div>
               <p className="text-xs text-muted-foreground">Paste this URL into your Lemlist Integrations settings.</p>
            </div>
         </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
         <Button variant="secondary">Cancel</Button>
         <Button>Save Changes</Button>
      </div>
    </div>
  );
};