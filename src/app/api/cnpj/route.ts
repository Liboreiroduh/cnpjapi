import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj');

  if (!cnpj) {
    return NextResponse.json(
      { error: 'CNPJ não fornecido' },
      { status: 400 }
    );
  }

  // Remove caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, '');

  if (cleanCnpj.length !== 14) {
    return NextResponse.json(
      { error: 'CNPJ inválido. Deve conter 14 dígitos.' },
      { status: 400 }
    );
  }

  try {
    // Usar apenas a API que está funcionando
    const apiUrl = `https://publica.cnpj.ws/cnpj/${cleanCnpj}`;
    
    console.log(`Consultando API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CNPJ-Query/1.0)'
      },
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Dados recebidos:', JSON.stringify(data).substring(0, 200));
      
      // Mapear dados para o formato esperado pelo frontend
      const mappedData = {
        // Dados principais
        cnpj: data.cnpj || data.estabelecimento?.cnpj || cleanCnpj,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia || data.estabelecimento?.nome_fantasia,
        
        // Situação cadastral
        situacao_cadastral: {
          situacao: data.situacao_cadastral || data.estabelecimento?.situacao_cadastral,
          data_situacao: data.data_situacao_cadastral || data.estabelecimento?.data_situacao_cadastral,
          motivo: data.motivo_situacao_cadastral || data.estabelecimento?.motivo_situacao_cadastral,
          situacao_especial: data.situacao_especial || data.estabelecimento?.situacao_especial,
          data_situacao_especial: data.data_situacao_especial || data.estabelecimento?.data_situacao_especial
        },
        
        // Natureza jurídica e porte
        natureza_juridica: data.natureza_juridica || {
          descricao: data.natureza_juridica?.descricao || data.natureza_juridica
        },
        porte: data.porte?.descricao || data.porte_empresa || data.porte,
        
        // Capital social
        capital_social: parseFloat(data.capital_social?.replace(',', '.') || data.capital_social || '0'),
        
        // Datas importantes
        data_inicio_atividade: data.data_inicio_atividade || data.estabelecimento?.data_inicio_atividade,
        matriz_filial: data.matriz_filial || data.estabelecimento?.tipo,
        
        // CNAEs
        cnae_principal: data.cnae_principal ? {
          codigo: data.cnae_principal.codigo || data.cnae_principal,
          descricao: data.cnae_principal.descricao || data.estabelecimento?.atividade_principal?.descricao
        } : data.estabelecimento?.atividade_principal ? {
          codigo: data.estabelecimento.atividade_principal.subclasse,
          descricao: data.estabelecimento.atividade_principal.descricao
        } : undefined,
        
        cnaes_secundarios: data.cnaes_secundarios || data.estabelecimento?.atividades_secundarias?.map((ativ: any) => ({
          codigo: ativ.codigo || ativ.subclasse,
          descricao: ativ.descricao
        })),
        
        // Endereço completo
        logradouro: data.logradouro || (data.estabelecimento?.tipo_logradouro ? 
          `${data.estabelecimento.tipo_logradouro} ${data.estabelecimento.logradouro}` : 
          data.estabelecimento?.logradouro),
        numero: data.numero || data.estabelecimento?.numero,
        complemento: data.complemento || data.estabelecimento?.complemento,
        bairro: data.bairro || data.estabelecimento?.bairro,
        municipio: data.municipio || data.estabelecimento?.cidade?.nome,
        uf: data.uf || data.estabelecimento?.estado?.sigla,
        cep: data.cep || data.estabelecimento?.cep,
        codigo_ibge: data.estabelecimento?.cidade?.ibge_id?.toString(),
        
        // Contatos
        telefones: data.telefones || [
          {
            ddd: data.estabelecimento?.ddd1,
            numero: data.estabelecimento?.telefone1,
            is_fax: false
          },
          {
            ddd: data.estabelecimento?.ddd2,
            numero: data.estabelecimento?.telefone2,
            is_fax: false
          }
        ].filter(t => t.ddd && t.numero),
        
        email: data.email || data.estabelecimento?.email,
        
        // Informações fiscais
        opcao_simples: data.opcao_simples || data.simples?.simples === 'Sim' ? 'S' : 'N',
        data_opcao_simples: data.data_opcao_simples || data.simples?.data_opcao_simples,
        opcao_mei: data.opcao_mei || data.simples?.mei === 'Sim' ? 'S' : 'N',
        data_opcao_mei: data.data_opcao_mei || data.simples?.data_opcao_mei,
        
        // Quadro societário (QSA)
        quadro_societario: data.QSA || data.socios?.map((socio: any) => ({
          nome: socio.nome || socio.nome_socio,
          documento: socio.cpf_cnpj_socio || socio.documento,
          tipo: socio.identificador_socio === 'Pessoa Física' || socio.tipo === 'Pessoa Física' ? 'PF' : 'PJ',
          qualificacao: socio.qualificacao_socio?.descricao || socio.qualificacao_socio || socio.qualificacao,
          data_entrada: socio.data_entrada_sociedade || socio.data_entrada,
          faixa_etaria: socio.faixa_etaria
        }))
      };
      
      return NextResponse.json(mappedData);
    }
    
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'CNPJ não encontrado' },
        { status: 404 }
      );
    }
    
    if (response.status === 429) {
      return NextResponse.json(
        { error: 'Limite de consultas excedido. Por favor, aguarde alguns minutos antes de tentar novamente.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: `Erro na consulta: Status ${response.status}` },
      { status: response.status }
    );

  } catch (error) {
    console.error('Erro na consulta CNPJ:', error);
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.' },
      { status: 500 }
    );
  }
}