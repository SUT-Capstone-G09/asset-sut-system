package services

import (
	"image"
	"image/color"
	"testing"
)

// solidImage returns an opaque WxH image, except for a single pixel at (0,0)
// which is given alpha, if fakeCornerPixelAlpha is non-nil — simulating the
// exact bypass this check must reject: a scanned signature with a solid
// background and one deliberately-faked transparent pixel.
func solidImage(w, h int, fakeCornerPixelAlpha *uint8) *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.NRGBA{R: 0, G: 0, B: 0, A: 255})
		}
	}
	if fakeCornerPixelAlpha != nil {
		img.Set(0, 0, color.NRGBA{R: 0, G: 0, B: 0, A: *fakeCornerPixelAlpha})
	}
	return img
}

// mostlyTransparentImage returns a WxH image that's transparent everywhere
// except a thin "pen stroke" down the middle column — like a real signature.
func mostlyTransparentImage(w, h int) *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.NRGBA{R: 0, G: 0, B: 0, A: 0})
		}
	}
	for y := 0; y < h; y++ {
		img.Set(w/2, y, color.NRGBA{R: 0, G: 0, B: 0, A: 255})
	}
	return img
}

func TestHasTransparentBackground_FullyOpaque_Rejected(t *testing.T) {
	img := solidImage(100, 100, nil)
	if hasTransparentBackground(img) {
		t.Error("want rejected: fully opaque image has zero transparent pixels")
	}
}

func TestHasTransparentBackground_SingleFakePixel_Rejected(t *testing.T) {
	// The exact bypass this test guards against: one corner pixel with
	// alpha=254 used to be enough to pass the old "at least one non-opaque
	// pixel" check on an otherwise solid 100x100 (10,000-pixel) image.
	alpha := uint8(254)
	img := solidImage(100, 100, &alpha)
	if hasTransparentBackground(img) {
		t.Error("want rejected: a single faked pixel must not satisfy the ratio threshold")
	}
}

func TestHasTransparentBackground_RealSignatureShape_Accepted(t *testing.T) {
	img := mostlyTransparentImage(100, 100)
	if !hasTransparentBackground(img) {
		t.Error("want accepted: mostly-transparent canvas with a thin stroke is a realistic signature")
	}
}

func TestHasTransparentBackground_FullyTransparent_Accepted(t *testing.T) {
	img := image.NewNRGBA(image.Rect(0, 0, 10, 10))
	if !hasTransparentBackground(img) {
		t.Error("want accepted: NRGBA zero-value pixels are fully transparent")
	}
}
