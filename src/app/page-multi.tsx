'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Building2, MapPin, Phone, Mail, Users, Briefcase, AlertCircle, CheckCircle, Clock, Zap, Globe } from 'lucide-react';

interface CNPJData {
  // Dados principais
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  
  // Situação cadastral
  situacao_cadastral?: {
    situacao?: string;
    data_situacao?: string;
    motivo?: string;
    situacao_especial?: string;
    data_situacao_especial?: string;
  };
  
  // Natureza jurídica e porte
  natureza_juridica?: {
    descricao?: string;
  };
  porte?: string;
  
  // Capital social e datas
  capital_social?: number;
  data_inicio_atividade?: string;
  matriz_filial?: string;
  
  // CNAEs
  cnae_principal?: {
    codigo?: string;
    descricao?: string;
  };
  cnaes_secundarios?: Array<{
    codigo?: string;
    descricao?: string;
  }>;
  
  // Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  codigo_ibge?: string;
  
  // Contatos
  telefones?: Array<{
    ddd?: string;
    numero?: string;
    is_fax?: boolean;
  }>;
  email?: string;
  
  // Informações fiscais
  opcao_simples?: string;
  data_opcao_simples?: string;
  opcao_mei?: string;
  data_opcao_mei?: string;
  
  // Quadro societário (QSA)
  quadro_societario?: Array<{
    nome?: string;
    documento?: string;
    tipo?: string;
    qualificacao?: string;
    data_entrada?: string;
    faixa_etaria?: string;
  }>;
  
  // Metadata da API
  _api_info?: {
    fonte?: string;
    url?: string;
    timestamp?: string;
  };
  
  // Campo de aviso
  _avisos?: {
    titulo?: string;
    mensagem?: string;
  };
}

export default function ConsultaCNPJMulti() {
  const [cnpjInput, setCnpjInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CNPJData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCNPJ = (value: string) => {
    // Remove caracteres não numéricos primeiro
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara do CNPJ: XX.XXX.XXX/XXXX-XX
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    } else if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    } else {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara apenas se houver números suficientes
    if (cleaned.length > 0) {
      value = formatCNPJ(cleaned);
    }
    
    // Atualiza o estado com o valor mascarado
    setCnpjInput(value);
  };

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Quando o usuário sai do campo, garante a formatação correta
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      setCnpjInput(formatCNPJ(cleaned));
    } else if (cleaned.length > 0) {
      // Se não tem 14 dígitos, mostra sem máscara para o usuário ver o que precisa corrigir
      setCnpjInput(cleaned);
    } else {
      setCnpjInput('');
    }
  };

  const clearInput = () => {
    setCnpjInput('');
    setError(null);
    setData(null);
  };

  const handleSearch = async () => {
    const cleanedCnpj = cnpjInput.replace(/\D/g, '');
    
    if (cleanedCnpj.length !== 14) {
      setError('CNPJ inválido. Deve conter 14 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/cnpj-multi?cnpj=${cleanedCnpj}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erro ao consultar CNPJ');
        return;
      }

      setData(result);
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const maskDocument = (doc?: string) => {
    if (!doc) return 'Não informado';
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900">Consulta CNPJ Multi-API</h1>
          <p className="text-zinc-600">Dados públicos via múltiplas APIs com bypass automático</p>
        </div>

        {/* Campo de Consulta */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Digite apenas números: 45259906000163"
                value={cnpjInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                className="flex-1"
                maxLength={18}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || cnpjInput.replace(/\D/g, '').length !== 14}
                className="min-w-[100px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Consultar Multi
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={clearInput}
                disabled={loading}
                className="min-w-[80px]"
              >
                Limpar
              </Button>
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              Digite apenas os 14 números do CNPJ. O sistema formatará automaticamente.
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              <strong>Teste rate limit:</strong> 45259906000163 | <strong>Funcionais:</strong> 23246139000115 | 04259026000110 | 33592510000154
            </div>
          </CardContent>
        </Card>

        {/* Mensagens de Erro */}
        {error && (
          <Alert variant={error.includes('Limite de consultas') || error.includes('Todas as APIs') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes('Limite de consultas') && (
                <div className="mt-2 text-sm">
                  💡 <strong>Dica:</strong> O sistema tentará múltiplas APIs automaticamente. 
                  Se todas falharem, aguarde alguns minutos.
                </div>
              )}
              {error.includes('Todas as APIs') && (
                <div className="mt-2 text-sm">
                  🌐 <strong>Alternativas:</strong> Tente novamente mais tarde ou use outras fontes de dados.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Info da API usada */}
        {data && data._api_info && (
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <strong>Fonte:</strong> {data._api_info.fonte}
              <div className="text-xs text-zinc-600 mt-1">
                Consultado em: {new Date(data._api_info.timestamp).toLocaleString('pt-BR')}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resultados */}
        {data && (
          <div className="space-y-6">
            {/* BLOCO 1 - DADOS GERAIS */}
            {(data.razao_social || data.nome_fantasia || data.cnpj || data.natureza_juridica?.descricao || data.porte) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Dados Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.razao_social && (
                    <div>
                      <span className="font-semibold text-zinc-700">Razão Social:</span>
                      <p className="text-zinc-900">{data.razao_social}</p>
                    </div>
                  )}
                  {data.nome_fantasia && (
                    <div>
                      <span className="font-semibold text-zinc-700">Nome Fantasia:</span>
                      <p className="text-zinc-900">{data.nome_fantasia}</p>
                    </div>
                  )}
                  {data.cnpj && (
                    <div>
                      <span className="font-semibold text-zinc-700">CNPJ:</span>
                      <p className="text-zinc-900">{formatCNPJ(data.cnpj)}</p>
                    </div>
                  )}
                  {data.matriz_filial && (
                    <div>
                      <span className="font-semibold text-zinc-700">Tipo:</span>
                      <Badge variant={data.matriz_filial === 'Matriz' ? 'default' : 'secondary'}>
                        {data.matriz_filial}
                      </Badge>
                    </div>
                  )}
                  {data.data_inicio_atividade && (
                    <div>
                      <span className="font-semibold text-zinc-700">Data de Abertura:</span>
                      <p className="text-zinc-900">{formatDate(data.data_inicio_atividade)}</p>
                    </div>
                  )}
                  {data.natureza_juridica?.descricao && (
                    <div>
                      <span className="font-semibold text-zinc-700">Natureza Jurídica:</span>
                      <p className="text-zinc-900">{data.natureza_juridica.descricao}</p>
                    </div>
                  )}
                  {data.porte && (
                    <div>
                      <span className="font-semibold text-zinc-700">Porte:</span>
                      <Badge variant="secondary">{data.porte}</Badge>
                    </div>
                  )}
                  {data.capital_social !== undefined && (
                    <div>
                      <span className="font-semibold text-zinc-700">Capital Social:</span>
                      <p className="text-zinc-900">{formatCurrency(data.capital_social)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BLOCO 2 - SITUAÇÃO CADASTRAL */}
            {data.situacao_cadastral && (data.situacao_cadastral.situacao || data.situacao_cadastral.data_situacao || data.situacao_cadastral.motivo || data.situacao_cadastral.situacao_especial) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Situação Cadastral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.situacao_cadastral.situacao && (
                    <div>
                      <span className="font-semibold text-zinc-700">Situação:</span>
                      <Badge 
                        variant={data.situacao_cadastral.situacao.includes('ATIVA') ? 'default' : 'destructive'}
                        className="ml-2"
                      >
                        {data.situacao_cadastral.situacao}
                      </Badge>
                    </div>
                  )}
                  {data.situacao_cadastral.data_situacao && (
                    <div>
                      <span className="font-semibold text-zinc-700">Data da Situação:</span>
                      <p className="text-zinc-900">{formatDate(data.situacao_cadastral.data_situacao)}</p>
                    </div>
                  )}
                  {data.situacao_cadastral.motivo && (
                    <div>
                      <span className="font-semibold text-zinc-700">Motivo:</span>
                      <p className="text-zinc-900">{data.situacao_cadastral.motivo}</p>
                    </div>
                  )}
                  {data.situacao_cadastral.situacao_especial && (
                    <div>
                      <span className="font-semibold text-zinc-700">Situação Especial:</span>
                      <p className="text-zinc-900">{data.situacao_cadastral.situacao_especial}</p>
                    </div>
                  )}
                  {data.situacao_cadastral.data_situacao_especial && (
                    <div>
                      <span className="font-semibold text-zinc-700">Data da Situação Especial:</span>
                      <p className="text-zinc-900">{formatDate(data.situacao_cadastral.data_situacao_especial)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BLOCO 3 - ATIVIDADE ECONÔMICA */}
            {(data.cnae_principal || data.cnaes_secundarios?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Atividade Econômica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.cnae_principal && (
                    <div>
                      <span className="font-semibold text-zinc-700">CNAE Principal:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="mr-2">
                          {data.cnae_principal.codigo}
                        </Badge>
                        <span className="text-zinc-900">{data.cnae_principal.descricao}</span>
                      </div>
                    </div>
                  )}
                  {data.cnaes_secundarios && data.cnaes_secundarios.length > 0 && (
                    <div>
                      <span className="font-semibold text-zinc-700">CNAEs Secundários:</span>
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                        {data.cnaes_secundarios.map((cnae, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs">
                              {cnae.codigo}
                            </Badge>
                            <span className="text-sm text-zinc-900">{cnae.descricao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BLOCO 4 - ENDEREÇO */}
            {(data.logradouro || data.numero || data.municipio || data.cep) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-semibold text-zinc-700">Endereço Completo:</span>
                    <p className="text-zinc-900">
                      {[
                        data.logradouro,
                        data.numero,
                        data.complemento,
                        data.bairro
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {(data.municipio || data.uf) && (
                    <div>
                      <span className="font-semibold text-zinc-700">Município / UF:</span>
                      <p className="text-zinc-900">
                        {data.municipio} / {data.uf}
                      </p>
                    </div>
                  )}
                  {data.cep && (
                    <div>
                      <span className="font-semibold text-zinc-700">CEP:</span>
                      <p className="text-zinc-900">{data.cep}</p>
                    </div>
                  )}
                  {data.codigo_ibge && (
                    <div>
                      <span className="font-semibold text-zinc-700">Código IBGE:</span>
                      <p className="text-zinc-900">{data.codigo_ibge}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BLOCO 5 - CONTATOS */}
            {(data.telefones?.length || data.email) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contatos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.telefones && data.telefones.length > 0 && (
                    <div>
                      <span className="font-semibold text-zinc-700">Telefones:</span>
                      <div className="mt-2 space-y-2">
                        {data.telefones.map((telefone, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-zinc-600" />
                            <span className="text-zinc-900">
                              ({telefone.ddd}) {telefone.numero}
                              {telefone.is_fax && <Badge variant="outline" className="ml-2 text-xs">FAX</Badge>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.email && (
                    <div>
                      <span className="font-semibold text-zinc-700">E-mail:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-zinc-600" />
                        <span className="text-zinc-900">{data.email}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BLOCO 6 - INFORMAÇÕES FISCAIS */}
            {(data.opcao_simples || data.opcao_mei) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Informações Fiscais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.opcao_simples && (
                    <div>
                      <span className="font-semibold text-zinc-700">Optante Simples Nacional:</span>
                      <Badge variant={data.opcao_simples === 'S' ? 'default' : 'secondary'} className="ml-2">
                        {data.opcao_simples === 'S' ? 'Sim' : 'Não'}
                      </Badge>
                      {data.data_opcao_simples && (
                        <p className="text-sm text-zinc-600 mt-1">
                          Desde: {formatDate(data.data_opcao_simples)}
                        </p>
                      )}
                    </div>
                  )}
                  {data.opcao_mei && (
                    <div>
                      <span className="font-semibold text-zinc-700">MEI:</span>
                      <Badge variant={data.opcao_mei === 'S' ? 'default' : 'secondary'} className="ml-2">
                        {data.opcao_mei === 'S' ? 'Sim' : 'Não'}
                      </Badge>
                      {data.data_opcao_mei && (
                        <p className="text-sm text-zinc-600 mt-1">
                          Desde: {formatDate(data.data_opcao_mei)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BLOCO 7 - QUADRO SOCIETÁRIO */}
            {data.quadro_societario && data.quadro_societario.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Quadro Societário (QSA)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Qualificação</TableHead>
                        <TableHead>Data Entrada</TableHead>
                        <TableHead>Faixa Etária</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.quadro_societario.map((socio, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{socio.nome || 'Não informado'}</TableCell>
                          <TableCell>{maskDocument(socio.documento)}</TableCell>
                          <TableCell>
                            <Badge variant={socio.tipo === 'PF' ? 'default' : 'secondary'}>
                              {socio.tipo || 'Não informado'}
                            </Badge>
                          </TableCell>
                          <TableCell>{socio.qualificacao || 'Não informada'}</TableCell>
                          <TableCell>{formatDate(socio.data_entrada)}</TableCell>
                          <TableCell>{socio.faixa_etaria || 'Não informada'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}