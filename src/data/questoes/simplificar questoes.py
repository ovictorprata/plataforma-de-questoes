import os
import json
import shutil
from pathlib import Path

def processar_arquivo_questoes():
    """
    Lê o arquivo escrevente.json do diretório onde o script está localizado,
    remove os campos 'banca', 'orgao', 'cargo', 'ano' e 'taxonomia' de cada questão,
    e salva uma cópia como escrevente_simples.json
    """
    
    # Obtém o diretório onde o script está localizado
    diretorio_script = Path(__file__).parent.absolute()
    
    # Caminho completo para o arquivo de entrada
    arquivo_entrada = diretorio_script / "escrevente.json"
    
    # Caminho completo para o arquivo de saída
    arquivo_saida = diretorio_script / "escrevente_simples.json"
    
    # Verifica se o arquivo de entrada existe
    if not arquivo_entrada.exists():
        print(f"Erro: Arquivo {arquivo_entrada} não encontrado!")
        print(f"Diretório atual: {diretorio_script}")
        return
    
    try:
        # Lê o arquivo JSON original
        with open(arquivo_entrada, 'r', encoding='utf-8') as f:
            dados = json.load(f)
        
        # Verifica se é uma lista de questões
        if not isinstance(dados, list):
            print("Erro: O arquivo não contém uma lista de questões!")
            return
        
        # Processa cada questão removendo os campos indesejados
        questoes_simples = []
        for questao in dados:
            # Remove os campos específicos
            questao_simples = questao.copy()  # Cria uma cópia para não modificar o original
            campos_para_remover = ['banca', 'orgao', 'cargo', 'ano', 'taxonomia']
            for campo in campos_para_remover:
                if campo in questao_simples:
                    del questao_simples[campo]
            questoes_simples.append(questao_simples)
        
        # Salva o novo arquivo JSON
        with open(arquivo_saida, 'w', encoding='utf-8') as f:
            json.dump(questoes_simples, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Arquivo processado com sucesso!")
        print(f"📁 Arquivo original: {arquivo_entrada}")
        print(f"📁 Arquivo simplificado: {arquivo_saida}")
        print(f"📊 Total de questões processadas: {len(questoes_simples)}")
        
    except json.JSONDecodeError as e:
        print(f"Erro ao ler o arquivo JSON: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")

def main():
    # Verifica se o script está sendo executado diretamente
    print("=" * 60)
    print("🔄 Bot para simplificar o arquivo escrevente.json")
    print("=" * 60)
    
    processar_arquivo_questoes()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()