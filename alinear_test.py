import unittest
from alinear import align

class TimingTest(unittest.TestCase):
    def test_exact_words_and_pauses(self):
        s=[{'text':'Hola','offsets':{'from':100,'to':400}},{'text':'mundo.','offsets':{'from':600,'to':1100}}]
        r=align('Hola mundo.',s,1.2)
        self.assertEqual(r['words'],[{'word':'Hola','start':.1,'end':.4},{'word':'mundo.','start':.6,'end':1.1}])
    def test_brand_spelling_keeps_detected_times(self):
        s=[{'text':'Comand','offsets':{'from':0,'to':400}},{'text':'Pos','offsets':{'from':400,'to':700}}]
        self.assertEqual(align('ComandPOS',s,1)['words'],[{'word':'ComandPOS','start':0,'end':.7}])
    def test_unrelated_audio_is_rejected(self):
        with self.assertRaises(ValueError):align('Venta bruta',[{'text':'xyz','offsets':{'from':0,'to':700}}],1)
    def test_missing_negation_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'negación'):
            align('No ofrecemos una demo gratis', [{'text':'Ofrecemos una demo gratis','offsets':{'from':0,'to':2500}}],3)
    def test_inserted_negation_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'negación'):
            align('Ofrecemos una demo', [{'text':'No ofrecemos una demo','offsets':{'from':0,'to':2500}}],3)
    def test_changed_price_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'cantidades'):
            align('El total es 150 pesos', [{'text':'El total es 1500 pesos','offsets':{'from':0,'to':2500}}],3)

if __name__=='__main__':unittest.main()
