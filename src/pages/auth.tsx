import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function AuthPage() {
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect)
    }
  }, [isAuthenticated, navigate, redirect])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 rounded-3xl border bg-card p-8 shadow-2xl md:p-12"
      >
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="mb-8 flex flex-col items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 group-hover:bg-primary/30 transition-colors" />
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FYmeBbUvrcRXaiHna0yTTg1YAEnD2%2Forbitlogo__e6d256de.png?alt=media&token=6cafb6d1-aa01-47aa-bf45-2a59c3cd4d73" 
                alt="Orbit Logo" 
                className="relative h-20 w-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black tracking-tighter italic">ORBIT</span>
              <span className="text-xs font-medium text-muted-foreground tracking-[0.2em] uppercase">Life Organizer</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Log in to your personal life command center</p>
        </div>

        <div className="grid gap-4 mt-8">
          <Button 
            onClick={() => signInWithGoogle()} 
            variant="outline" 
            size="xl"
            className="w-full h-14 rounded-2xl gap-3 text-lg font-medium hover:bg-secondary/50 transition-all border-2"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button 
            variant="ghost" 
            size="xl"
            className="w-full h-14 rounded-2xl gap-3 text-lg font-medium opacity-50 cursor-not-allowed"
            disabled
          >
            <Mail className="h-6 w-6" />
            Continue with Email
          </Button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground italic">Your evolution starts here</span>
          </div>
        </div>

        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing page
        </Link>
      </motion.div>
    </div>
  )
}
