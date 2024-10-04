import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'

interface ShippingConfirmationProps {
  email: string
  address: string
  onChangeContact: () => void
  onChangeShipping: () => void
  onContinue: () => void
}

export function ShippingConfirmation({
  email,
  address,
  onChangeContact,
  onChangeShipping,
  onContinue
}: ShippingConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <span>{email}</span>
          <Button variant="outline" onClick={onChangeContact}>Change</Button>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Ship to</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <span>{address}</span>
          <Button variant="outline" onClick={onChangeShipping}>Change</Button>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Shipping method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded">
            <span>Standard Shipping</span>
            <span>$5.00</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onContinue} className="w-full bg-black text-white">
        Continue to payment
      </Button>
    </motion.div>
  )
}