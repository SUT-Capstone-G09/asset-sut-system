package services

import (
	"strings"
	"testing"
)

func TestHtmlToText(t *testing.T) {
	in := `<html><head><style>body{color:red}</style></head>
<body>
  <h1>การจองได้รับการอนุมัติ</h1>
  <p>เรียน คุณสมชาย</p>
  <p>ยอดที่ต้องชำระ <strong>500.00&nbsp;บาท</strong></p>
  <a href="https://app.sut.ac.th/pay/1">ชำระเงิน</a>
  <script>console.log("x")</script>
</body></html>`

	got := htmlToText(in)

	for _, want := range []string{"การจองได้รับการอนุมัติ", "เรียน คุณสมชาย", "500.00", "บาท", "ชำระเงิน"} {
		if !strings.Contains(got, want) {
			t.Errorf("expected output to contain %q\ngot:\n%s", want, got)
		}
	}
	for _, unwanted := range []string{"<", ">", "console.log", "color:red", "&nbsp;"} {
		if strings.Contains(got, unwanted) {
			t.Errorf("did not expect output to contain %q\ngot:\n%s", unwanted, got)
		}
	}
	t.Logf("output:\n%s", got)
}
