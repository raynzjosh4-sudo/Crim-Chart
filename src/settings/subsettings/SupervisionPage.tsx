import { Bell, Clock, Shield, Users } from 'lucide-react';
import React from 'react';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

const SupervisionPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <ChartAppBar title="Supervision" />

            <main className="p-6">
                {/* Hero Section */}
                <section className="bg-foreground/5 rounded-2xl p-6 flex flex-col items-center text-center">
                    <Shield className="w-12 h-12 text-primary" strokeWidth={1.5} />
                    <h2 className="text-[20px] font-bold mt-4">Family Center</h2>
                    <p className="text-[14px] text-foreground/60 mt-2 leading-relaxed">
                        Supervision helps you support your teen's experience on Chart with tools
                        to see who they follow, who follows them, and how much time they spend on the app.
                    </p>
                </section>

                {/* Feature List */}
                <div className="mt-8 space-y-6">
                    <InfoItem
                        icon={<Clock size={20} />}
                        title="Manage time limits"
                        subtitle="Set daily limits for how long your teen can use Chart."
                    />
                    <InfoItem
                        icon={<Users size={20} />}
                        title="See member list"
                        subtitle="View who your teen joins and who joins their channels."
                    />
                    <InfoItem
                        icon={<Bell size={20} />}
                        title="Privacy notifications"
                        subtitle="Get notified when your teen changes their privacy settings."
                    />
                </div>

                {/* Call to Action */}
                <button className="w-full mt-10 h-[50px] bg-primary text-white rounded-[12px] font-bold text-[16px] transition-opacity hover:opacity-90">
                    Get started
                </button>
            </main>
        </div>
    );
};

// Reusable Info Item Component
interface InfoItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, title, subtitle }) => {
    return (
        <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2.5 rounded-[10px] text-primary shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="text-[16px] font-bold text-foreground">{title}</h4>
                <p className="text-[13px] text-foreground/50 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
};

export default SupervisionPage;
