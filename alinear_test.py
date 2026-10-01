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

if __name__=='__main__':unittest.main()
