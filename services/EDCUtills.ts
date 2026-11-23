import toast from 'react-hot-toast'

export class EDCUtilWeb {
  port: any = null
  writer: WritableStreamDefaultWriter | null = null
  reader: ReadableStreamDefaultReader | null = null

  // Enhanced device identification for Windows
  private readonly VEGA_3000_FILTERS = [
    {
      usbVendorId: 0x1a86, // Castles Technology
      usbProductId: 0x2211, // Vega 3000
    },
  ]

  async connect() {
    if (this.port?.readable && this.port?.writable && this.writer && this.reader) {
      return
    }

    if (!this.port) {
      // ขั้นตอนที่ 1: ลองหา Vega 3000 ที่ paired แล้วก่อน
      const availablePorts = await (navigator as any).serial.getPorts()
      const vegaPorts = availablePorts.filter((port: any) => {
        const info = port.getInfo()
        return this.isVega3000Device(info)
      })

      if (vegaPorts.length > 0) {
        // ใช้ Vega 3000 ที่ paired แล้ว
        this.port = vegaPorts[0]
      } else {
        try {
          // แสดง port ทั้งหมดให้เลือก (ไม่กรอง)
          this.port = await (navigator as any).serial.requestPort()

          const portInfo = this.port.getInfo()

          // แจ้งเตือนถ้าไม่ใช่ Vega 3000
          if (!this.isVega3000Device(portInfo)) {
            toast.error('กรุณาเลือกอุปกรณ์ POS-terminal เท่านั้น')
          } else {
            console.log('[EDC] ✅ Selected device is a Castles Vega 3000')
          }
        } catch (error) {
          throw error
        }
      }
    }

    // เปิด port connection
    if (!this.port.readable || !this.port.writable) {
      try {
        await this.port.open({
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        })
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as any).message === 'string' &&
          (error as any).message.includes('already open')
        ) {
        } else {
          throw error
        }
      }
    }

    // Set up writer
    if (!this.writer && this.port.writable) {
      this.writer = this.port.writable.getWriter()
    }

    // Set up reader
    if (!this.reader && this.port.readable) {
      const textDecoder = new TextDecoderStream()
      this.port.readable.pipeTo(textDecoder.writable)
      this.reader = textDecoder.readable.getReader()
    }
  }

  // ปรับปรุง method สำหรับแสดงข้อมูล port ทั้งหมด
  async getAllAvailablePorts() {
    const ports = await (navigator as any).serial.getPorts()

    const portInfos = ports.map((port: any) => {
      const info = port.getInfo()
      return {
        port: port,
        vendorId: `0x${info.usbVendorId?.toString(16).padStart(4, '0').toUpperCase()}`,
        productId: `0x${info.usbProductId?.toString(16).padStart(4, '0').toUpperCase()}`,
        windowsDeviceId: `USB\\VID_${info.usbVendorId
          ?.toString(16)
          .padStart(4, '0')
          .toUpperCase()}&PID_${info.usbProductId?.toString(16).padStart(4, '0').toUpperCase()}`,
        manufacturer: info.usbManufacturer || 'Unknown',
        product: info.usbProduct || 'Unknown',
        serialNumber: info.usbSerialNumber || 'Unknown',
        isVega3000: this.isVega3000Device(info),
      }
    })

    return portInfos
  }

  // Method สำหรับหา Vega 3000 ports เท่านั้น
  async getVega3000Ports() {
    const ports = await (navigator as any).serial.getPorts()

    const vegaPorts = ports.filter((port: any) => {
      const info = port.getInfo()
      return this.isVega3000Device(info)
    })

    return vegaPorts
  }

  // Enhanced device identification matching Windows device ID format
  public isVega3000Device(info: any): boolean {
    if (!info) return false
    const vendorMatch = info.usbVendorId === 0x1a86 // WCH vendor (CH340/CH374)
    const validProducts = [0x55d4, 0x55d3, 0x7523, 0x2211] // ครอบคลุม CH374/CH340 variants
    const productMatch = validProducts.includes(info.usbProductId)
    return vendorMatch && productMatch
  }

  async disconnect() {
    // Close reader first
    if (this.reader) {
      try {
        await this.reader.cancel()
        this.reader.releaseLock()
      } catch (err) {
        console.warn('[EDC] Error closing reader:', err)
      }
      this.reader = null
    }

    // Close writer
    if (this.writer) {
      try {
        await this.writer.close()
        this.writer.releaseLock()
      } catch (err) {
        console.warn('[EDC] Error closing writer:', err)
      }
      this.writer = null
    }

    // Wait a bit for streams to be fully released
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Close port
    if (this.port) {
      try {
        await this.port.close()
      } catch (err) {
        console.warn('[EDC] Error closing port:', err)
      }
      this.port = null
    }
  }

  async isConnected(): Promise<boolean> {
    const connected =
      this.port !== null &&
      this.port.readable !== null &&
      this.port.writable !== null &&
      this.writer !== null &&
      this.reader !== null

    return connected
  }

  // Method to get detailed device information
  async getDeviceInfo() {
    if (!this.port) {
      throw new Error('No device connected')
    }

    const info = this.port.getInfo()
    const deviceInfo = {
      vendorId: `0x${info.usbVendorId?.toString(16).padStart(4, '0').toUpperCase()}`,
      productId: `0x${info.usbProductId?.toString(16).padStart(4, '0').toUpperCase()}`,
      windowsDeviceId: `USB\\VID_${info.usbVendorId
        ?.toString(16)
        .padStart(4, '0')
        .toUpperCase()}&PID_${info.usbProductId?.toString(16).padStart(4, '0').toUpperCase()}`,
      manufacturer: info.usbManufacturer || 'Unknown',
      product: info.usbProduct || 'Unknown',
      serialNumber: info.usbSerialNumber || 'Unknown',
      isVega3000: this.isVega3000Device(info),
    }

    return deviceInfo
  }

  async processPayment(amount: number, method: 'edc-credit' | 'edc-qr') {
    if (!this.writer || !this.reader) throw new Error('Not connected to EDC')

    let hexString = ''
    if (method === 'edc-credit') {
      hexString = this.generateCreditPaymentHex(amount)
    } else if (method === 'edc-qr') {
      hexString = this.generateQrPaymentHex(amount)
    }

    const payload = this.hexToUint8Array(hexString)

    await this.writer.write(payload)

    const responseBuffer: number[] = []
    const timeout = 180000 // 3 minutes timeout
    const startTime = Date.now()

    while (true) {
      const elapsed = Date.now() - startTime

      if (elapsed > timeout) {
        console.error('❌ Timeout after', elapsed, 'ms')
        throw new Error('Timeout waiting for EDC response')
      }

      try {
        const { value, done } = await this.reader.read()

        if (done) {
          console.log('🔚 Reader done')
          break
        }

        if (value) {
          // แปลง string เป็น bytes ก่อน (เพราะ reader คืน string มา)
          const bytes = []
          for (let i = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i))
          }

          // เพิ่มลง buffer
          for (const byte of bytes) {
            responseBuffer.push(byte)
          }

          // เช็ค ETX (0x03)
          if (responseBuffer.includes(0x03)) {
            break
          }
        }
      } catch (readError) {
        throw readError
      }

      await new Promise((res) => setTimeout(res, 100))
    }

    // แสดงข้อมูลทั้งหมด

    // Parse
    const responseData = Buffer.from(responseBuffer)
    const parsed = this.parseData(responseData)
    console.log('📄 Parsed response:', parsed)
    console.log('responseData (hex):', responseData.toString('hex').toUpperCase())

    return parsed
  }

  hexToUint8Array(hexString: string): Uint8Array {
    const cleanHex = hexString.replace(/[^0-9A-Fa-f]/g, '')
    const bytes = new Uint8Array(cleanHex.length / 2)
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
    }
    return bytes
  }

  async voidTransaction(traceNumber: string) {
  if (!this.writer || !this.reader) throw new Error('Not connected to EDC')

  const hexString = this.generateVoidTransactionHex(traceNumber)
  console.log('🔵 [VOID] Generated hex command:', hexString)

  const payload = this.hexToUint8Array(hexString)
  console.log(
    '🔵 [VOID] Payload bytes:',
    Array.from(payload)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ')
  )

  // ส่งคำสั่ง VOID
  await this.writer.write(payload)
  console.log('✅ [VOID] Command sent to EDC')

  const responseBuffer: number[] = []
  const timeout = 180000 // 3 นาที
  const startTime = Date.now()
  let receivedAck = false

  while (true) {
    const elapsed = Date.now() - startTime
    if (elapsed > timeout) {
      console.error('❌ Timeout after', elapsed, 'ms')
      throw new Error('Timeout waiting for EDC response')
    }

    try {
      const { value, done } = await this.reader.read()

      if (done) {
        console.log('🔚 [VOID] Reader done')
        break
      }

      if (value) {
        // value = Uint8Array หรือ string → แปลงเป็น bytes
        const bytes: number[] =
          typeof value === 'string'
            ? Array.from(value).map(ch => ch.charCodeAt(0))
            : Array.from(value)

        console.log(
          '📥 [VOID] Received bytes:',
          bytes.map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
        )

        for (const byte of bytes) {
          if (byte === 0x06) {
            console.log('✅ [VOID] Received ACK (0x06), EDC accepted command')
            receivedAck = true
            // ❗️อย่า continue — ให้รอ message ต่อ
            continue
          }

          if (byte === 0x15) {
            console.error('❌ [VOID] Received NAK (0x15) — Command Rejected by EDC')
            throw new Error('EDC rejected VOID command')
          }

          responseBuffer.push(byte)
        }

        // ถ้าได้รับ ACK แล้ว รอ response 2 วิ (บางเครื่องจะดีเลย์)
        if (receivedAck && responseBuffer.length === 0) {
          console.log('⏳ [VOID] ACK received, waiting for EDC response...')
          await new Promise(res => setTimeout(res, 2000))
        }

        // เช็คเจอ STX + ETX = จบ message
        if (responseBuffer.includes(0x02) && responseBuffer.includes(0x03)) {
          console.log('✅ [VOID] Found complete message (STX + ETX)')
          break
        }
      }
    } catch (readError) {
      console.error('❌ [VOID] Read error:', readError)
      throw readError
    }

    await new Promise(res => setTimeout(res, 100))
  }

  console.log(
    '🔵 [VOID] Final buffer:',
    responseBuffer.map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
  )

  // ✅ Parse message
  if (responseBuffer.length > 0) {
    const responseData = Buffer.from(responseBuffer)
    const parsed = this.parseData(responseData)
    console.log('📄 [VOID] Parsed response:', parsed)
    console.log('📄 [VOID] Response hex:', responseData.toString('hex').toUpperCase())
    return parsed
  } else {
    console.warn('⚠️ [VOID] No data received after ACK')
    return null
  }
}

generateVoidTransactionHex(traceNumber: string) {
  // ใช้ format แบบเดียวกับ generateCreditPaymentHex
  const tpdu = '3630' // "60"
  const tpduRest = '30303030' // "0000"
  const tpduEnd = '30303030' // "0000"
  const transactionPart1 = '31' // "1"
  const transactionPart2 = '30' // "0"
  const transactionCode = '3236' // "71" 
  const transactionSuffix = '3030' // "00"
  const zero = '30' // "0"
  const sep = '1C'

  // Field 65 (Invoice No./Trace No.) - ANS, Length 6
  const traceFieldType = '3635' // '65'
  const traceFieldLength = '0006'
  const traceStr = traceNumber.padStart(6, '0')
  const traceFieldData = Buffer.from(traceStr, 'ascii').toString('hex')

  console.log('🔧 [VOID HEX] Trace number:', traceNumber, '→', traceStr)
  console.log('🔧 [VOID HEX] Trace field data (hex):', traceFieldData)

  const body =
    tpdu +
    tpduRest +
    tpduEnd +
    transactionPart1 +
    transactionPart2 +
    transactionCode +
    transactionSuffix +
    zero +
    sep +
    traceFieldType +
    traceFieldLength +
    traceFieldData +
    sep

  const bodyLength = body.length / 2
  const lengthHex = bodyLength.toString().padStart(4, '0').toUpperCase()

  console.log('🔧 [VOID HEX] Body length:', bodyLength, '→', lengthHex)
  console.log('🔧 [VOID HEX] Body:', body)

  const stx = '02'
  const etx = '03'

  const messageWithoutChecksum = stx + lengthHex + body + etx

  const bytes = Buffer.from(messageWithoutChecksum, 'hex')
  let checksum = 0
  for (let i = 1; i < bytes.length; i++) {
    checksum ^= bytes[i]
  }

  const checksumHex = checksum.toString(16).padStart(2, '0').toUpperCase()
  
  const finalMessage = messageWithoutChecksum + checksumHex
  
  console.log('🔧 [VOID HEX] Final message:', finalMessage)
  console.log('🔧 [VOID HEX] Checksum:', checksumHex)
  
  return finalMessage
}

  generateQrPaymentHex(amount: any) {
    const tpdu = '36303030303030303030' // "6000000000"
    const transactionCode = '31303730303031' // "107001"
    const sep = '1C'

    const amountInt = Math.round(parseFloat(amount) * 100)
    const amountStr = amountInt.toString().padStart(12, '0')
    const amountFieldType = '3430' // '40'
    const amountFieldLength = '0012'
    const amountFieldData = Buffer.from(amountStr, 'ascii').toString('hex')

    const walletFieldType = '4131' // 'A1'
    const walletFieldLength = '0002'
    const walletFieldData = Buffer.from('05', 'ascii').toString('hex') // QR Payment = 05

    const body =
      tpdu +
      transactionCode +
      sep +
      amountFieldType +
      amountFieldLength +
      amountFieldData +
      sep +
      walletFieldType +
      walletFieldLength +
      walletFieldData +
      sep

    const bodyLength = body.length / 2
    const lengthHex = bodyLength.toString().padStart(4, '0').toUpperCase()

    const stx = '02'
    const etx = '03'

    const messageWithoutChecksum = stx + lengthHex + body + etx

    const bytes = Buffer.from(messageWithoutChecksum, 'hex')
    let lrc = 0
    for (let i = 1; i < bytes.length; i++) lrc ^= bytes[i]

    const lrcHex = lrc.toString(16).padStart(2, '0').toUpperCase()
    return messageWithoutChecksum + lrcHex
  }

  generateCreditPaymentHex(amount: any) {
    const amountInt = Math.round(parseFloat(amount) * 100)
    const amountStr = amountInt.toString().padStart(12, '0')

    const amountFieldType = '3430'
    const amountLength = '0012'
    const amountHex = Buffer.from(amountStr, 'ascii').toString('hex').toUpperCase()

    const body =
      '3630' +
      '30303030' +
      '30303030' +
      '31' +
      '30' +
      '3230' +
      '3030' +
      '30' +
      '1C' +
      amountFieldType +
      amountLength +
      amountHex +
      '1C'

    const bodyLength = body.length / 2
    const lengthHex = bodyLength.toString().padStart(4, '0').toUpperCase()

    const stx = '02'
    const etx = '03'

    const messageWithoutChecksum = stx + lengthHex + body + etx

    const bytes = Buffer.from(messageWithoutChecksum, 'hex')
    let checksum = 0
    for (let i = 1; i < bytes.length; i++) {
      checksum ^= bytes[i]
    }

    const checksumHex = checksum.toString(16).padStart(2, '0').toUpperCase()

    return messageWithoutChecksum + checksumHex
  }

  parseData(dataBuffer: Buffer) {
    let hex = dataBuffer.toString('hex').toUpperCase()

    console.log('🔍 Original hex:', hex)

    // ลบ ACK (06) ถ้ามีอยู่หน้าสุด
    if (hex.startsWith('06')) {
      hex = hex.slice(2)
    }

    // หา STX (02)
    const stxIndex = hex.indexOf('02')
    if (stxIndex === -1) return this.parseDirectData(hex)

    // อ่าน Length (4 hex chars หลัง STX)
    const lengthHex = hex.slice(stxIndex + 2, stxIndex + 6)
    const bodyLength = parseInt(lengthHex, 16) * 2 // แปลงเป็น hex chars

    // หา Body (เริ่มหลัง length)
    const bodyStart = stxIndex + 6
    const bodyEnd = bodyStart + bodyLength
    const body = hex.slice(bodyStart, bodyEnd)

    // ถ้าใน body มี 1C (field separator) ใช้ parseMessageBody
    if (body.includes('1C')) {
      return this.parseMessageBody(body)
    } else {
      return this.parseDirectData(body)
    }
  }

  parseMessageBody(body: string) {
    const sepHex = '1C'
    const fieldsHex = body.split(sepHex)

    const parsedFields = []

    for (let i = 0; i < fieldsHex.length; i++) {
      const fieldHex = fieldsHex[i]

      if (fieldHex.length < 8) continue

      const fieldType = fieldHex.slice(0, 4)
      const fieldLenHex = fieldHex.slice(4, 8)
      const fieldLen = parseInt(fieldLenHex, 16) // เปลี่ยนจาก parseInt(x, 10) เป็น 16

      console.log(`🏷️ Field ${fieldType}: length=${fieldLen} (hex: ${fieldLenHex})`)

      const maxDataLength = Math.min(fieldLen * 2, fieldHex.length - 8)
      const fieldDataHex = fieldHex.slice(8, 8 + maxDataLength)
      const fieldData = Buffer.from(fieldDataHex, 'hex').toString('ascii').trim()

      parsedFields.push({
        type: fieldType,
        length: fieldLen,
        value: fieldData,
      })

      console.log(`   → Value: "${fieldData}"`)
    }

    // Field type 3032 = Result Code
    const resultField = parsedFields.find((f) => f.type === '3032')
    const resultText = resultField?.value || ''

    // ตรวจสอบ approval
    const isApproved =
      resultText.toLowerCase().includes('approved') || resultText === '00' || resultText.includes('APPROVAL')

    const result = {
      status: isApproved ? 'success' : 'fail',
      message: resultText || 'Unknown response',
      fields: parsedFields,
    }

    return result
  }

  parseDirectData(hex: string) {
    const sepHex = '1C'
    const parts = hex.split(sepHex)

    let approvalFound = false
    let approvalMessage = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.length >= 8) {
        try {
          const fieldType = part.slice(0, 4)
          const fieldLenHex = part.slice(4, 8)
          const fieldLen = parseInt(fieldLenHex, 16) // เปลี่ยนเป็น base 16

          if (fieldLen > 0 && part.length >= 8 + fieldLen * 2) {
            const fieldDataHex = part.slice(8, 8 + fieldLen * 2)
            const fieldData = Buffer.from(fieldDataHex, 'hex').toString('ascii').trim()

            if (fieldType === '3032' || fieldData.toLowerCase().includes('approval')) {
              approvalFound = true
              approvalMessage = fieldData
            }
          }
        } catch (e) {
          console.log('  ⚠️ Error parsing part:', e)
        }
      }
    }

    const result = {
      status: approvalFound ? 'success' : 'fail',
      message: approvalMessage || 'Response parsed without standard format',
    }

    return result
  }
}
