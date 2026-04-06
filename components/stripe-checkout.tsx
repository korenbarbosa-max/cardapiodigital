'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2, X, ArrowLeft } from 'lucide-react'

import { createCheckoutSession, getCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  extras?: Array<{ name: string; price: number }>
}

interface StripeCheckoutProps {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  customerName: string
  customerPhone: string
  customerAddress: string
  observations?: string
  isPreOrder?: boolean
  onSuccess: (sessionId: string) => void
  onCancel: () => void
}

export default function StripeCheckout({
  items,
  subtotal,
  deliveryFee,
  total,
  customerName,
  customerPhone,
  customerAddress,
  observations,
  isPreOrder,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'checkout' | 'processing' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const result = await createCheckoutSession({
          items,
          subtotal,
          deliveryFee,
          total,
          customerName,
          customerPhone,
          customerAddress,
          observations,
          isPreOrder,
        })
        setClientSecret(result.clientSecret)
        setSessionId(result.sessionId)
        setStatus('checkout')
      } catch (error) {
        console.error('[v0] Error creating checkout session:', error)
        setErrorMessage('Erro ao iniciar pagamento. Tente novamente.')
        setStatus('error')
      }
    }

    initCheckout()
  }, [items, subtotal, deliveryFee, total, customerName, customerPhone, customerAddress, observations, isPreOrder])

  const handleComplete = useCallback(async () => {
    if (!sessionId) return

    setStatus('processing')

    try {
      const session = await getCheckoutSession(sessionId)
      
      if (session.paymentStatus === 'paid') {
        setStatus('success')
        setTimeout(() => {
          onSuccess(sessionId)
        }, 2000)
      } else {
        setErrorMessage('Pagamento não foi concluído. Tente novamente.')
        setStatus('error')
      }
    } catch (error) {
      console.error('[v0] Error checking payment status:', error)
      setErrorMessage('Erro ao verificar pagamento. Tente novamente.')
      setStatus('error')
    }
  }, [sessionId, onSuccess])

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600">Preparando pagamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-red-600">Erro no Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">{errorMessage}</p>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600">Processando pagamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-green-600">Pagamento Aprovado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Seu pedido foi confirmado e está sendo processado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Pagamento com Cartao</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {clientSecret && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                clientSecret,
                onComplete: handleComplete,
              }}
            >
              <EmbeddedCheckout className="min-h-[400px]" />
            </EmbeddedCheckoutProvider>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
