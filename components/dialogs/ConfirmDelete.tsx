import { Dialog, DialogContentText, DialogActions, Button } from '@mui/material'

interface ConfirmDeleteProps {
  text: string
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDelete(props: ConfirmDeleteProps) {
  return (
    <Dialog
      sx={{ padding: 2 }}
      open={props.open}
      PaperProps={{
        style: {
          borderRadius: 20,
        },
      }}>
      <DialogContentText sx={{ padding: 5 }}>{props.text}</DialogContentText>
      <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
        <Button
          color="primary"
          variant="contained"
          onClick={props.onConfirm}
          autoFocus>
          ยืนยัน
        </Button>
        <Button
          onClick={props.onCancel}
          autoFocus
          color="warning"
          variant="contained">
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  )
}
