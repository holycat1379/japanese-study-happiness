import Groq from "groq-sdk";
import {ref, watchEffect} from "vue";
import {useLocalStorage} from "@vueuse/core";


const useAiGrammar = () => {
    const keyStorage = useLocalStorage<any>('keyStorage', [])

    const groq = ref()

    watchEffect(()=>{
        groq.value = new Groq({
            apiKey: keyStorage.value,
            dangerouslyAllowBrowser: true,
        })
    })

    const grammar = ref('')

    const textStorage = useLocalStorage<any>('textlist', [])

    async function getGrammarByQroq(msg:string) {
        const completion = await groq.value.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `As a professional Japanese teacher, please explain the grammar of the sentence I sent you：${msg}`,
                },
            ],
            model: 'mixtral-8x7b-32768',
        })
        return completion.choices[0]?.message?.content || ''
    }

    function saveText(key: string, text: string) {
        // 更新已保存的文本
        if (textStorage.value.some((item:any) => item.key === key)) {
            const index = textStorage.value.findIndex((item:any) => item.key === key)
            textStorage.value[index].text = text
        }
        // 增加新的文本
        else {
            textStorage.value.push({
                key,
                text,
            })
        }
    }

    async function generateGrammar(keyText:string) {
        const item = textStorage.value.find((item:any) => item.key === keyText)
        if (!item){
            const tempText = await getGrammarByQroq(keyText)
            const splitText = tempText.split('\n')
            const renderedText = splitText.map((line:any) => {
                return `<p>${line}</p>`
            }).join('')
            grammar.value = renderedText
            saveText(keyText, renderedText)
        }  else{
            grammar.value = item.text
        }
    }


    return {
        generateGrammar,
        grammar
    }
}

export default useAiGrammar