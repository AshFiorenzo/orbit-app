import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { CheckCircle2, TrendingUp, Shield, Sparkles, ArrowRight, MousePointer2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function LandingPage() {
  const { login } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]" />
      </div>

      <header className="sticky top-0 z-50 flex h-20 items-center justify-between bg-background/80 px-6 backdrop-blur-md md:px-12 border-b">
        <div className="flex items-center gap-2">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FYmeBbUvrcRXaiHna0yTTg1YAEnD2%2Forbitlogo__e6d256de.png?alt=media&token=6cafb6d1-aa01-47aa-bf45-2a59c3cd4d73" 
            alt="Orbit Logo" 
            className="h-10 w-10"
          />
          <div className="text-2xl font-bold tracking-tighter">ORBIT</div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => login()} className="hidden sm:flex">Log In</Button>
          <Button onClick={() => login()} size="lg" className="rounded-full px-6">Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6 py-12 text-center md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-5xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-bounce-subtle">
              <Sparkles className="h-4 w-4" />
              <span>All-in-one life management</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
              Application that <span className="text-primary">Revolve</span> Your Life
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl lg:text-2xl leading-relaxed">
              Stop switching between dozens of apps. Orbit brings tasks, habits, finances, and goals into one beautiful, intuitive space. It's your ultimate workspace for your personal evolution.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button size="xl" className="group min-w-[200px] rounded-full text-lg h-14" onClick={() => login()}>
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="px-6 py-24 md:px-12 bg-secondary/30 border-y relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-dots-pattern opacity-[0.3]" />
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold md:text-5xl tracking-tight mb-4">Master Every Aspect</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to thrive, organized with surgical precision.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<CheckCircle2 className="h-6 w-6" />}
                title="Task Management"
                description="Organize work with smart tasks, deadlines, and multi-stage projects"
                delay={0.1}
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Habit Tracking"
                description="Build healthy routines with streak tracking and daily check-ins"
                delay={0.2}
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Finance Control"
                description="Monitor expenses, subscriptions, and savings goals in one place"
                delay={0.3}
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="Lifestyle Journal"
                description="Keep track of your workouts and personal notes effortlessly."
                delay={0.4}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-12 bg-background md:px-12">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            2026 Orbit. Made for Your Perfect Life. Made by Aung Koko
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-8 transition-all hover:-translate-y-2 hover:shadow-xl hover:border-primary/50"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}
