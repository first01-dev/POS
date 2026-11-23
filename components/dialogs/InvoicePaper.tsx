import { Close, Print } from '@mui/icons-material'
import { Dialog, DialogContent, DialogContentText, Fab } from '@mui/material'

interface InvoicePaperProps {
  html: string
  open: boolean
  onClose: () => void
}

export default function InvoicePaper(props: InvoicePaperProps) {
  return (
    <Dialog open={props.open}>
      {/* TEST BUTTON */}
      <Fab color="primary" aria-label="add" className="float-btn-bill hide-on-print" onClick={props.onClose}>
        <Close />
      </Fab>
      <Fab color="info" aria-label="add" className="float-btn-bill-2 hide-on-print" onClick={(_) => print()}>
        <Print />
      </Fab>
      {/* TEST BUTTON */}
      <DialogContent>
        <DialogContentText>
          <div
            className="textInvoice"
            dangerouslySetInnerHTML={{
              __html: props.html,
            }}
          />
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}
